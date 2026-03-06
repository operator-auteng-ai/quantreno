import { tool } from "ai";
import type { Session } from "next-auth";
import { z } from "zod";
import { getRecentTradesByUserId } from "@/lib/db/queries";

type GetTradeHistoryProps = { session: Session };

export const getTradeHistory = ({ session }: GetTradeHistoryProps) =>
  tool({
    description: `Fetch the user's trade history from the local database. Returns recent trades with
status (open, closed, cancelled), entry/exit prices, P&L, and strategy notes.
Use when the user asks "show my trades", "trade history", or "what did I buy?".`,
    inputSchema: z.object({
      limit: z
        .number()
        .min(1)
        .max(100)
        .default(20)
        .describe("Maximum number of trades to return (default 20, max 100)"),
      status: z
        .enum(["open", "closed", "cancelled"])
        .optional()
        .describe("Filter by trade status"),
    }),
    execute: async ({ limit, status }) => {
      try {
        const trades = await getRecentTradesByUserId({
          userId: session.user.id,
          limit,
        });

        const filtered = status
          ? trades.filter((t) => t.status === status)
          : trades;

        return {
          trades: filtered.map((t) => ({
            id: t.id,
            ticker: t.ticker,
            side: t.side,
            action: t.action,
            contracts: t.count,
            entry_price_cents: t.priceCents,
            entry_price_dollars: (t.priceCents / 100).toFixed(2),
            total_cost_cents: t.totalCostCents,
            total_cost_dollars: (t.totalCostCents / 100).toFixed(2),
            status: t.status,
            exit_price_cents: t.exitPriceCents,
            exit_price_dollars: t.exitPriceCents
              ? (t.exitPriceCents / 100).toFixed(2)
              : null,
            pnl_cents: t.pnlCents,
            pnl_dollars: t.pnlCents ? (t.pnlCents / 100).toFixed(2) : null,
            strategy: t.strategy,
            notes: t.notes,
            order_id: t.orderId,
            opened_at: t.createdAt.toISOString(),
            closed_at: t.closedAt?.toISOString() ?? null,
          })),
          total: filtered.length,
          summary: {
            open: filtered.filter((t) => t.status === "open").length,
            closed: filtered.filter((t) => t.status === "closed").length,
            cancelled: filtered.filter((t) => t.status === "cancelled").length,
            total_realized_pnl_cents: filtered
              .filter((t) => t.pnlCents !== null)
              .reduce((sum, t) => sum + (t.pnlCents ?? 0), 0),
          },
        };
      } catch (error) {
        return {
          error:
            error instanceof Error
              ? error.message
              : "Failed to fetch trade history",
          trades: [],
          total: 0,
          summary: {
            open: 0,
            closed: 0,
            cancelled: 0,
            total_realized_pnl_cents: 0,
          },
        };
      }
    },
  });
