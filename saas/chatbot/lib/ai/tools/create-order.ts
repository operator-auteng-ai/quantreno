import { tool } from "ai";
import type { Session } from "next-auth";
import { z } from "zod";
import { getKalshiClientForUser } from "@/lib/kalshi";
import { logTrade } from "@/lib/db/queries";

type CreateOrderProps = { session: Session };

export const createOrder = ({ session }: CreateOrderProps) =>
  tool({
    description: `Place a limit order on Kalshi. IMPORTANT: This tool requires user confirmation
before executing — always present the order details to the user and wait for approval.

Rules:
- Only limit orders are supported (market orders were removed Feb 11, 2026)
- For YES side: supply yes_price (cents, 1–99)
- For NO side: supply no_price (cents, 1–99)
- Yes price + No price of a contract = 100 cents
- Verify the market is still active with getMarkets before placing an order
- Always show the user: ticker, side, action, contracts, price, estimated cost`,
    inputSchema: z.object({
      ticker: z.string().describe("Kalshi market ticker, e.g. KXCPI-26MAR-T0.4"),
      side: z.enum(["yes", "no"]).describe("Which side to trade"),
      action: z.enum(["buy", "sell"]).describe("Buy to open, sell to close"),
      count: z
        .number()
        .int()
        .min(1)
        .describe("Number of contracts"),
      yes_price: z
        .number()
        .int()
        .min(1)
        .max(99)
        .optional()
        .describe("Limit price in cents for YES side (required when side=yes)"),
      no_price: z
        .number()
        .int()
        .min(1)
        .max(99)
        .optional()
        .describe("Limit price in cents for NO side (required when side=no)"),
      client_order_id: z
        .string()
        .optional()
        .describe("Optional idempotency key"),
    }),
    needsApproval: true,
    execute: async ({ ticker, side, action, count, yes_price, no_price, client_order_id }) => {
      try {
        const client = await getKalshiClientForUser(session.user.id);

        const { order } = await client.createOrder({
          ticker,
          side,
          action,
          count,
          yes_price,
          no_price,
          client_order_id,
        });

        const price = side === "yes" ? order.yes_price : order.no_price;
        const cost_cents = price * count;

        // Auto-log the trade (fire-and-forget — don't fail the order on DB error)
        logTrade({
          userId: session.user.id,
          orderId: order.order_id,
          ticker: order.ticker,
          side: order.side as "yes" | "no",
          action: order.action as "buy" | "sell",
          count: order.count,
          priceCents: price,
          totalCostCents: cost_cents,
        }).catch(() => {
          // Non-fatal
        });

        return {
          success: true,
          order_id: order.order_id,
          ticker: order.ticker,
          side: order.side,
          action: order.action,
          count: order.count,
          price_cents: price,
          price_dollars: (price / 100).toFixed(2),
          estimated_cost_cents: cost_cents,
          estimated_cost_dollars: (cost_cents / 100).toFixed(2),
          status: order.status,
        };
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error ? error.message : "Order placement failed",
        };
      }
    },
  });
