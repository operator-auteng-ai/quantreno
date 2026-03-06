import { tool } from "ai";
import type { Session } from "next-auth";
import { z } from "zod";
import {
  getDefaultConfig,
  INSTRUMENT_TYPE_VALUES,
  PLAYBOOK_VALUES,
  type Playbook,
  validateStrategyConfig,
} from "@/lib/ai/strategies/playbook-schemas";
import { createStrategy as dbCreateStrategy } from "@/lib/db/queries";
import { log } from "@/lib/logger";

type CreateStrategyProps = { session: Session };

export const createStrategy = ({ session }: CreateStrategyProps) =>
  tool({
    description: `Create a new trading strategy. Structure the user's idea into a strategy with the appropriate playbook, budget, and config.

Playbooks:
- event_driven: Trade around known catalysts (data releases, votes, decisions). Timeline: hours to days.
- relative_value: Find mispricing between mathematically related markets. Timeline: days to weeks.
- tail_risk: Build portfolios of cheap asymmetric payoffs (≤3¢ contracts). Timeline: weeks to months.
- momentum: Detect and ride sustained price drift with volume confirmation. Timeline: days to weeks.
- mean_reversion: Fade sharp moves when catalyst doesn't justify the spike. Timeline: hours to days.
- macro_thematic: Map and trade causal chains (e.g., Tariffs → supply costs → CPI → Fed). Timeline: weeks to months.

Guidelines:
- Always set a budget. If the user doesn't specify, suggest a reasonable amount and explain.
- Populate config fields relevant to the chosen playbook (filters, entry/exit rules, research queries, etc.).
- V1 only supports instrumentType "prediction_market".
- For macro_thematic, populate the causalChain array in config.
- For event_driven, populate catalystDate and catalystType in config when known.
- For tail_risk, set maxEntryCents (1-5, default 3) and targetPortfolioSize.`,
    inputSchema: z.object({
      name: z
        .string()
        .min(1)
        .max(128)
        .describe(
          "Human-readable strategy name, e.g. 'Oil Supply Chain' or 'March Fed Meeting'"
        ),
      playbook: z.enum(PLAYBOOK_VALUES).describe("Which playbook to use"),
      instrumentType: z
        .enum(INSTRUMENT_TYPE_VALUES)
        .default("prediction_market")
        .describe("V1: always prediction_market"),
      budgetCents: z
        .number()
        .int()
        .positive()
        .describe("Strategy budget in cents (e.g., 10000 = $100)"),
      config: z
        .record(z.unknown())
        .default({})
        .describe(
          "Playbook-specific config: filters, entryRules, exitRules, sizing, research, and playbook extensions"
        ),
    }),
    execute: async ({
      name,
      playbook,
      instrumentType,
      budgetCents,
      config,
    }) => {
      try {
        const userId = session.user?.id;

        // Merge user-provided config with playbook defaults
        const defaultConfig = getDefaultConfig(playbook as Playbook);
        const mergedConfig = { ...defaultConfig, ...config };

        // Validate against playbook schema
        const validation = validateStrategyConfig(
          playbook as Playbook,
          mergedConfig
        );
        if (!validation.success) {
          return {
            success: false,
            error: `Invalid config for ${playbook} playbook: ${validation.error.message}`,
          };
        }

        const strat = await dbCreateStrategy({
          userId,
          name,
          playbook,
          instrumentType,
          budgetCents,
          config: validation.data as Record<string, unknown>,
        });

        log.info("tool", "createStrategy succeeded", {
          userId,
          strategyId: strat.id,
          playbook,
          budgetCents,
        });

        return {
          success: true,
          strategy: {
            id: strat.id,
            name: strat.name,
            playbook: strat.playbook,
            instrumentType: strat.instrumentType,
            budgetCents: strat.budgetCents,
            budgetDollars: (strat.budgetCents / 100).toFixed(2),
            status: strat.status,
            config: strat.config,
            createdAt: strat.createdAt.toISOString(),
          },
        };
      } catch (error) {
        log.error("tool", "createStrategy failed", {
          userId: session.user?.id,
          error: error instanceof Error ? error.message : String(error),
        });
        return {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to create strategy",
        };
      }
    },
  });
