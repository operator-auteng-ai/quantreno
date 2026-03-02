import { tool } from "ai";
import type { Session } from "next-auth";
import { z } from "zod";
import { getKalshiClientForUser } from "@/lib/kalshi";

type GetPositionsProps = { session: Session };

export const getPositions = ({ session }: GetPositionsProps) =>
  tool({
    description: `Fetch the user's current Kalshi portfolio: account balance, open positions,
and resting orders. Use this to check buying power before sizing a trade, to report
current P&L, or to see which markets the user is already exposed to.`,
    inputSchema: z.object({
      include_orders: z
        .boolean()
        .default(true)
        .describe("Include resting (unfilled) orders alongside positions"),
      ticker: z
        .string()
        .optional()
        .describe("Filter to a specific market ticker"),
    }),
    execute: async ({ include_orders, ticker }) => {
      try {
        const client = await getKalshiClientForUser(session.user.id);

        const [balanceData, positionsData, ordersData] = await Promise.all([
          client.getBalance(),
          client.getPositions({
            ticker,
            count_filter: "position",
          }),
          include_orders
            ? client.getOrders({ status: "resting", ticker })
            : Promise.resolve({ orders: [] }),
        ]);

        // Debug: surface raw response shape so we can diagnose mismatches
        const rawKeys = Object.keys(positionsData);
        const rawPositions = (positionsData as any).positions
          ?? (positionsData as any).market_positions
          ?? (positionsData as any).event_positions
          ?? (positionsData as any).market_exposures
          ?? [];
        console.log(
          "[getPositions] raw response keys:", rawKeys,
          "positions count:", rawPositions.length,
          "sample:", JSON.stringify(rawPositions[0] ?? {}).slice(0, 200)
        );

        const positions = rawPositions.filter(
          (p: any) => p.position !== 0
        );

        return {
          _debug_response_keys: rawKeys,
          _debug_raw_count: rawPositions.length,
          balance_cents: balanceData.balance,
          balance_dollars: (balanceData.balance / 100).toFixed(2),
          positions: positions.map((p: any) => ({
            ticker: p.ticker,
            position: p.position, // positive = net yes, negative = net no
            side: p.position > 0 ? "yes" : "no",
            contracts: Math.abs(p.position),
            realized_pnl_cents: p.realized_pnl_cents,
            market_exposure_cents: p.market_exposure_cents,
          })),
          resting_orders: ordersData.orders.map((o) => ({
            order_id: o.order_id,
            ticker: o.ticker,
            side: o.side,
            action: o.action,
            yes_price: o.yes_price,
            no_price: o.no_price,
            count: o.count,
            filled_count: o.filled_count,
            remaining_count: o.remaining_count,
          })),
          position_count: positions.length,
          resting_order_count: ordersData.orders.length,
        };
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to fetch portfolio";
        console.error("[getPositions] Kalshi API error:", message, error);
        return {
          success: false,
          error: `KALSHI API ERROR: ${message}. The user should check Settings > Kalshi Account.`,
          balance_cents: 0,
          balance_dollars: "0.00",
          positions: [],
          resting_orders: [],
          position_count: 0,
          resting_order_count: 0,
        };
      }
    },
  });
