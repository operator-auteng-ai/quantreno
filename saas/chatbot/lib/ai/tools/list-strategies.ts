import { tool } from "ai";
import type { Session } from "next-auth";
import { z } from "zod";
import { STRATEGY_STATUS_VALUES } from "@/lib/ai/strategies/playbook-schemas";
import { getStrategiesByUserId, getStrategyTradeStats } from "@/lib/db/queries";
import { log } from "@/lib/logger";

type ListStrategiesProps = { session: Session };

export const listStrategies = ({ session }: ListStrategiesProps) =>
  tool({
    description: `List the user's trading strategies with status, playbook, budget, and open position count.
Use when the user asks "what strategies do I have?", "show my strategies", or "list strategies".
Can filter by status (active, paused, archived).`,
    inputSchema: z.object({
      status: z
        .enum(STRATEGY_STATUS_VALUES)
        .optional()
        .describe("Filter by strategy status. Omit to show all."),
    }),
    execute: async ({ status }) => {
      try {
        const userId = session.user?.id;
        const [strategies, tradeStats] = await Promise.all([
          getStrategiesByUserId({ userId, status }),
          getStrategyTradeStats({ userId }),
        ]);

        const statsMap = new Map(
          tradeStats
            .filter((s): s is typeof s & { strategyId: string } =>
              Boolean(s.strategyId)
            )
            .map((s) => [s.strategyId, s])
        );

        return {
          strategies: strategies.map((s) => {
            const stats = statsMap.get(s.id);
            return {
              id: s.id,
              name: s.name,
              playbook: s.playbook,
              instrumentType: s.instrumentType,
              budgetCents: s.budgetCents,
              budgetDollars: (s.budgetCents / 100).toFixed(2),
              status: s.status,
              openPositions: stats?.openCount ?? 0,
              config: s.config,
              createdAt: s.createdAt.toISOString(),
              updatedAt: s.updatedAt.toISOString(),
            };
          }),
          total: strategies.length,
        };
      } catch (error) {
        log.error("tool", "listStrategies failed", {
          userId: session.user?.id,
          error: error instanceof Error ? error.message : String(error),
        });
        return { strategies: [], total: 0, error: "Failed to list strategies" };
      }
    },
  });
