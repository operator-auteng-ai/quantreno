import { tool } from "ai";
import type { Session } from "next-auth";
import { z } from "zod";
import { getOpenTradesByUserId } from "@/lib/db/queries";
import { getKalshiClientForUser } from "@/lib/kalshi";
import { log } from "@/lib/logger";

type GetPortfolioProps = { session: Session };

export const getPortfolio = ({ session }: GetPortfolioProps) =>
  tool({
    description: `Fetch the user's full portfolio summary with live market prices and unrealized P&L.
Combines Kalshi live positions with the local Trade table to compute gains/losses per position.
Use when the user asks "how are my positions?", "what's my P&L?", or "portfolio summary".`,
    inputSchema: z.object({
      ticker: z
        .string()
        .optional()
        .describe("Filter to a specific market ticker"),
    }),
    execute: async ({ ticker }) => {
      try {
        const client = await getKalshiClientForUser(session.user.id);

        const [balanceData, positionsData, openTrades] = await Promise.all([
          client.getBalance(),
          client.getPositions({
            ticker,
            count_filter: "position",
          }),
          getOpenTradesByUserId({ userId: session.user.id }),
        ]);

        const positions = (positionsData.positions ?? []).filter(
          (p) => p.position !== 0
        );

        // Build a map of entry prices from Trade table keyed by ticker
        const tradesByTicker = new Map<
          string,
          { priceCents: number; count: number; action: string; side: string }
        >();
        for (const t of openTrades) {
          tradesByTicker.set(t.ticker, {
            priceCents: t.priceCents,
            count: t.count,
            action: t.action,
            side: t.side,
          });
        }

        // Fetch live market data for each position to get current prices
        const marketDataResults = await Promise.allSettled(
          positions.map((p) => client.getMarket(p.ticker))
        );

        const portfolio = positions.map((p, i) => {
          const side = p.position > 0 ? "yes" : "no";
          const contracts = Math.abs(p.position);
          const tradeEntry = tradesByTicker.get(p.ticker);

          // Get live price from market data
          const marketResult = marketDataResults[i];
          let currentPriceCents: number | null = null;
          let marketTitle: string | undefined;
          if (marketResult.status === "fulfilled") {
            const market = marketResult.value.market;
            currentPriceCents = side === "yes" ? market.yes_bid : market.no_bid;
            marketTitle = market.title;
          }

          // Compute unrealized P&L if we have both entry and current price
          let unrealizedPnlCents: number | null = null;
          if (tradeEntry && currentPriceCents !== null) {
            const entryPrice = tradeEntry.priceCents;
            // For buy positions: pnl = (current - entry) * contracts
            // For sell positions: pnl = (entry - current) * contracts
            if (tradeEntry.action === "buy") {
              unrealizedPnlCents = (currentPriceCents - entryPrice) * contracts;
            } else {
              unrealizedPnlCents = (entryPrice - currentPriceCents) * contracts;
            }
          }

          return {
            ticker: p.ticker,
            title: marketTitle,
            side,
            contracts,
            entry_price_cents: tradeEntry?.priceCents ?? null,
            current_price_cents: currentPriceCents,
            unrealized_pnl_cents: unrealizedPnlCents,
            unrealized_pnl_dollars:
              unrealizedPnlCents !== null
                ? (unrealizedPnlCents / 100).toFixed(2)
                : null,
            realized_pnl_cents: p.realized_pnl_cents,
            market_exposure_cents: p.market_exposure_cents,
          };
        });

        const totalUnrealizedCents = portfolio.reduce(
          (sum, p) => sum + (p.unrealized_pnl_cents ?? 0),
          0
        );
        const totalRealizedCents = portfolio.reduce(
          (sum, p) => sum + p.realized_pnl_cents,
          0
        );

        return {
          balance_cents: balanceData.balance,
          balance_dollars: (balanceData.balance / 100).toFixed(2),
          positions: portfolio,
          position_count: portfolio.length,
          total_unrealized_pnl_cents: totalUnrealizedCents,
          total_unrealized_pnl_dollars: (totalUnrealizedCents / 100).toFixed(2),
          total_realized_pnl_cents: totalRealizedCents,
          total_realized_pnl_dollars: (totalRealizedCents / 100).toFixed(2),
        };
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to fetch portfolio";
        log.error("getPortfolio", message, {
          userId: session.user.id,
          error: error instanceof Error ? error.stack : String(error),
        });
        return {
          success: false,
          error: `KALSHI API ERROR: ${message}. The user should check Settings > Kalshi Account.`,
          balance_cents: 0,
          balance_dollars: "0.00",
          positions: [],
          position_count: 0,
          total_unrealized_pnl_cents: 0,
          total_unrealized_pnl_dollars: "0.00",
          total_realized_pnl_cents: 0,
          total_realized_pnl_dollars: "0.00",
        };
      }
    },
  });
