import { tool } from "ai";
import type { Session } from "next-auth";
import { z } from "zod";
import {
  type Playbook,
  STRATEGY_STATUS_VALUES,
  validateStrategyConfig,
} from "@/lib/ai/strategies/playbook-schemas";
import {
  updateStrategy as dbUpdateStrategy,
  getStrategyById,
} from "@/lib/db/queries";
import { log } from "@/lib/logger";

type UpdateStrategyProps = { session: Session };

export const updateStrategy = ({ session }: UpdateStrategyProps) =>
  tool({
    description: `Update an existing strategy's name, budget, config, or status.
Use when the user wants to:
- Change strategy settings or filters
- Pause or resume a strategy
- Adjust budget
- Archive a strategy they no longer want
Requires the strategy ID — use listStrategies first if you don't have it.`,
    inputSchema: z.object({
      strategyId: z.string().uuid().describe("ID of the strategy to update"),
      name: z.string().min(1).max(128).optional().describe("New strategy name"),
      budgetCents: z
        .number()
        .int()
        .positive()
        .optional()
        .describe("New budget in cents"),
      status: z
        .enum(STRATEGY_STATUS_VALUES)
        .optional()
        .describe("New status: active, paused, or archived"),
      config: z
        .record(z.unknown())
        .optional()
        .describe("Updated config fields — merges with existing config"),
    }),
    execute: async ({ strategyId, name, budgetCents, status, config }) => {
      try {
        const userId = session.user?.id;

        const existing = await getStrategyById({ id: strategyId, userId });
        if (!existing) {
          return {
            success: false,
            error: "Strategy not found or does not belong to you.",
          };
        }

        // If config is being updated, merge and validate
        let validatedConfig: Record<string, unknown> | undefined;
        if (config) {
          const merged = {
            ...(existing.config as Record<string, unknown>),
            ...config,
          };
          const validation = validateStrategyConfig(
            existing.playbook as Playbook,
            merged
          );
          if (!validation.success) {
            return {
              success: false,
              error: `Invalid config: ${validation.error.message}`,
            };
          }
          validatedConfig = validation.data as Record<string, unknown>;
        }

        const updates: Record<string, unknown> = {};
        if (name !== undefined) {
          updates.name = name;
        }
        if (budgetCents !== undefined) {
          updates.budgetCents = budgetCents;
        }
        if (status !== undefined) {
          updates.status = status;
        }
        if (validatedConfig !== undefined) {
          updates.config = validatedConfig;
        }

        if (Object.keys(updates).length === 0) {
          return { success: false, error: "No fields to update." };
        }

        const updated = await dbUpdateStrategy({
          id: strategyId,
          userId,
          updates,
        });

        if (!updated) {
          return { success: false, error: "Update failed." };
        }

        log.info("tool", "updateStrategy succeeded", {
          userId,
          strategyId,
          fields: Object.keys(updates),
        });

        return {
          success: true,
          strategy: {
            id: updated.id,
            name: updated.name,
            playbook: updated.playbook,
            instrumentType: updated.instrumentType,
            budgetCents: updated.budgetCents,
            budgetDollars: (updated.budgetCents / 100).toFixed(2),
            status: updated.status,
            config: updated.config,
            updatedAt: updated.updatedAt.toISOString(),
          },
        };
      } catch (error) {
        log.error("tool", "updateStrategy failed", {
          userId: session.user?.id,
          strategyId,
          error: error instanceof Error ? error.message : String(error),
        });
        return {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to update strategy",
        };
      }
    },
  });
