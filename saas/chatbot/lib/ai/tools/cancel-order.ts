import { tool } from "ai";
import type { Session } from "next-auth";
import { z } from "zod";
import { getKalshiClientForUser } from "@/lib/kalshi";

type CancelOrderProps = { session: Session };

export const cancelOrder = ({ session }: CancelOrderProps) =>
  tool({
    description: `Cancel a resting (unfilled) order on Kalshi. Requires user confirmation.
Use getPositions first to get the order_id of resting orders. Only resting orders
can be cancelled — already-filled orders cannot be reversed.`,
    inputSchema: z.object({
      order_id: z
        .string()
        .describe("The Kalshi order ID to cancel (from getPositions resting_orders)"),
    }),
    needsApproval: true,
    execute: async ({ order_id }) => {
      try {
        const client = await getKalshiClientForUser(session.user.id);
        const { order } = await client.cancelOrder(order_id);

        return {
          success: true,
          order_id: order.order_id,
          ticker: order.ticker,
          status: order.status,
          message: `Order ${order_id} cancelled successfully.`,
        };
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error ? error.message : "Order cancellation failed",
        };
      }
    },
  });
