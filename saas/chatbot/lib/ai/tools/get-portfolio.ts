import { tool } from "ai";
import type { Session } from "next-auth";
import { z } from "zod";
import { getKalshiClientForUser } from "@/lib/kalshi";
import type { KalshiPosition } from "@/lib/kalshi/types";
import { log } from "@/lib/logger";

type GetPortfolioProps = { session: Session };

/** Max positions to include in portfolio summary */
const MAX_POSITIONS = 50;

export const getPortfolio = ({ session }: GetPortfolioProps) =>
  tool({
    description: `Fetch the user's full portfolio summary with live market prices, entry prices, and unrealized P&L.
Uses market_exposure from Kalshi to derive average entry prices, then compares against live market
bids to calculate unrealized gains/losses per position.
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

        const [balanceData, positionsData] = await Promise.all([
          client.getBalance(),
          client.getPositions({
            ticker,
            count_filter: "position",
            limit: MAX_POSITIONS,
          }),
        ]);

        const positions = (positionsData.positions ?? []).filter(
          (p: KalshiPosition) => p.position !== 0
        );

        // Fetch live market data in a single batch call
        const tickerList = positions.map((p: KalshiPosition) => p.ticker);
        const marketMap = new Map<
          string,
          { yes_bid: number; no_bid: number; title: string }
        >();

        if (tickerList.length > 0) {
          const marketsData = await client.getMarkets({
            tickers: tickerList.join(","),
            limit: MAX_POSITIONS,
          });
          for (const m of marketsData.markets) {
            marketMap.set(m.ticker, {
              yes_bid: m.yes_bid,
              no_bid: m.no_bid,
              title: m.title,
            });
          }
        }

        const portfolio = positions.map((p: KalshiPosition) => {
          const side = p.position > 0 ? "yes" : "no";
          const contracts = Math.abs(p.position);

          // Entry price from market_exposure: exposure = cost basis = entry × contracts
          const entryPriceCents =
            contracts > 0
              ? Math.round(p.market_exposure_cents / contracts)
              : null;

          // Get live price from batch market data
          const market = marketMap.get(p.ticker);
          const currentPriceCents = market
            ? side === "yes"
              ? market.yes_bid
              : market.no_bid
            : null;

          // Compute unrealized P&L if we have both entry and current price
          let unrealizedPnlCents: number | null = null;
          if (entryPriceCents !== null && currentPriceCents !== null) {
            unrealizedPnlCents =
              (currentPriceCents - entryPriceCents) * contracts;
          }

          return {
            ticker: p.ticker,
            title: market?.title,
            side,
            contracts,
            entry_price_cents: entryPriceCents,
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

        log.info("getPortfolio", "fetched", {
          userId: session.user.id,
          positionCount: portfolio.length,
          totalUnrealized: totalUnrealizedCents,
          totalRealized: totalRealizedCents,
        });

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
