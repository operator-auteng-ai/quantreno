import { tool } from "ai";
import type { Session } from "next-auth";
import { z } from "zod";
import { getKalshiClientForUser } from "@/lib/kalshi";
import type { KalshiMarket } from "@/lib/kalshi/types";

type GetMarketsProps = { session: Session };

/** Subset of market fields safe to pass back to the LLM */
function summarizeMarket(m: KalshiMarket) {
  return {
    ticker: m.ticker,
    event_ticker: m.event_ticker,
    title: m.title,
    status: m.status,
    yes_bid: m.yes_bid,
    yes_ask: m.yes_ask,
    no_bid: m.no_bid,
    no_ask: m.no_ask,
    last_price: m.last_price,
    volume_24h: m.volume_24h,
    open_interest: m.open_interest,
    close_time: m.close_time,
  };
}

export const getMarkets = ({ session }: GetMarketsProps) =>
  tool({
    description: `Scan Kalshi markets and events. Use this to discover what's trading,
check prices on specific tickers, or filter by event/series. Returns structured market
data including yes/no bid-ask spreads, volume, and settlement times. Always use this
before recommending a trade to get current prices.

To browse by category, first use browseCategories to find the series_ticker, then pass
it here to get markets for that series.`,
    inputSchema: z.object({
      event_ticker: z
        .string()
        .optional()
        .describe("Filter to markets within a specific event (e.g. KXCPI-26MAR)"),
      series_ticker: z
        .string()
        .optional()
        .describe(
          "Filter to markets within a series (e.g. CPI, FED, KXBTC). Use browseCategories to discover series."
        ),
      tickers: z
        .string()
        .optional()
        .describe("Comma-separated list of specific market tickers to fetch"),
      limit: z
        .number()
        .int()
        .min(1)
        .max(100)
        .default(20)
        .describe("Number of markets to return (default 20, max 100)"),
      status: z
        .enum(["open", "closed", "settled"])
        .optional()
        .describe("Filter by market status. Omit to get all active markets."),
    }),
    execute: async ({ event_ticker, series_ticker, tickers, limit, status }) => {
      try {
        const client = await getKalshiClientForUser(session.user.id);

        const { markets } = await client.getMarkets({
          event_ticker,
          series_ticker,
          tickers,
          limit,
          status,
        });

        return {
          markets: markets.map(summarizeMarket),
          count: markets.length,
        };
      } catch (error) {
        return {
          error:
            error instanceof Error ? error.message : "Failed to fetch markets",
          markets: [],
          count: 0,
        };
      }
    },
  });
