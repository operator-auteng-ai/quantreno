import "server-only";

import { and, count, desc, eq, sql, sum } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { ChatbotError } from "../errors";
import { strategy, type Strategy, trade, type Trade } from "./schema";

// biome-ignore lint: Forbidden non-null assertion.
const client = postgres(process.env.POSTGRES_URL!);
const db = drizzle(client);

// ── Types ────────────────────────────────────────────────────────────────────────

export type TradeWithStrategy = Trade & { strategyName: string | null };

export type DashboardSummary = {
  totalRealizedPnlCents: number;
  totalAllocatedBudgetCents: number;
  totalSpentCents: number;
  openTradesCount: number;
  closedTradesCount: number;
};

export type DashboardData = {
  strategies: Strategy[];
  openTrades: TradeWithStrategy[];
  recentTrades: Trade[];
  summary: DashboardSummary;
  tradeCountsByStrategy: Array<{ strategyId: string | null; openCount: number }>;
};

// ── Queries ──────────────────────────────────────────────────────────────────────

async function getDashboardSummary(
  userId: string
): Promise<DashboardSummary> {
  try {
    // Aggregate P&L from closed trades
    const [pnlRow] = await db
      .select({
        totalPnl: sum(trade.pnlCents),
        closedCount: count(trade.id),
      })
      .from(trade)
      .where(and(eq(trade.userId, userId), eq(trade.status, "closed")));

    // Count open trades
    const [openRow] = await db
      .select({ openCount: count(trade.id) })
      .from(trade)
      .where(and(eq(trade.userId, userId), eq(trade.status, "open")));

    // Aggregate strategy budgets and trade costs
    const [budgetRow] = await db
      .select({ totalBudget: sum(strategy.budgetCents) })
      .from(strategy)
      .where(eq(strategy.userId, userId));

    const [spentRow] = await db
      .select({ totalSpent: sum(trade.totalCostCents) })
      .from(trade)
      .where(and(eq(trade.userId, userId), eq(trade.status, "open")));

    return {
      totalRealizedPnlCents: Number(pnlRow?.totalPnl ?? 0),
      totalAllocatedBudgetCents: Number(budgetRow?.totalBudget ?? 0),
      totalSpentCents: Number(spentRow?.totalSpent ?? 0),
      openTradesCount: openRow?.openCount ?? 0,
      closedTradesCount: pnlRow?.closedCount ?? 0,
    };
  } catch (_error) {
    throw new ChatbotError(
      "bad_request:database",
      "Failed to get dashboard summary"
    );
  }
}

async function getOpenTradesWithStrategy(
  userId: string
): Promise<TradeWithStrategy[]> {
  try {
    const rows = await db
      .select({
        trade,
        strategyName: strategy.name,
      })
      .from(trade)
      .leftJoin(strategy, eq(trade.strategyId, strategy.id))
      .where(and(eq(trade.userId, userId), eq(trade.status, "open")))
      .orderBy(desc(trade.createdAt));

    return rows.map((r) => ({
      ...r.trade,
      strategyName: r.strategyName,
    }));
  } catch (_error) {
    throw new ChatbotError(
      "bad_request:database",
      "Failed to get open trades with strategy"
    );
  }
}

async function getRecentActivityFeed(
  userId: string,
  limit = 10
): Promise<Trade[]> {
  try {
    return await db
      .select()
      .from(trade)
      .where(eq(trade.userId, userId))
      .orderBy(desc(trade.createdAt))
      .limit(limit);
  } catch (_error) {
    throw new ChatbotError(
      "bad_request:database",
      "Failed to get recent activity"
    );
  }
}

async function getStrategiesForDashboard(
  userId: string
): Promise<Strategy[]> {
  try {
    return await db
      .select()
      .from(strategy)
      .where(eq(strategy.userId, userId))
      .orderBy(desc(strategy.createdAt));
  } catch (_error) {
    throw new ChatbotError(
      "bad_request:database",
      "Failed to get strategies"
    );
  }
}

async function getTradeCountsByStrategy(
  userId: string
): Promise<Array<{ strategyId: string | null; openCount: number }>> {
  try {
    return await db
      .select({
        strategyId: trade.strategyId,
        openCount: count(trade.id),
      })
      .from(trade)
      .where(and(eq(trade.userId, userId), eq(trade.status, "open")))
      .groupBy(trade.strategyId);
  } catch (_error) {
    return [];
  }
}

// ── Main entry point ─────────────────────────────────────────────────────────────

/**
 * Fetches all dashboard data in parallel.
 * Uses Promise.allSettled so partial failures don't break the page.
 */
export async function getDashboardData(
  userId: string
): Promise<DashboardData> {
  const [
    summaryResult,
    strategiesResult,
    openTradesResult,
    recentTradesResult,
    tradeCountsResult,
  ] = await Promise.allSettled([
    getDashboardSummary(userId),
    getStrategiesForDashboard(userId),
    getOpenTradesWithStrategy(userId),
    getRecentActivityFeed(userId),
    getTradeCountsByStrategy(userId),
  ]);

  return {
    summary:
      summaryResult.status === "fulfilled"
        ? summaryResult.value
        : {
            totalRealizedPnlCents: 0,
            totalAllocatedBudgetCents: 0,
            totalSpentCents: 0,
            openTradesCount: 0,
            closedTradesCount: 0,
          },
    strategies:
      strategiesResult.status === "fulfilled" ? strategiesResult.value : [],
    openTrades:
      openTradesResult.status === "fulfilled" ? openTradesResult.value : [],
    recentTrades:
      recentTradesResult.status === "fulfilled"
        ? recentTradesResult.value
        : [],
    tradeCountsByStrategy:
      tradeCountsResult.status === "fulfilled" ? tradeCountsResult.value : [],
  };
}
