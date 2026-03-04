import { z } from "zod";

// ─── Enums ────────────────────────────────────────────────────────────────────

export const PLAYBOOK_VALUES = [
  "event_driven",
  "relative_value",
  "tail_risk",
  "momentum",
  "mean_reversion",
  "macro_thematic",
] as const;

export type Playbook = (typeof PLAYBOOK_VALUES)[number];

export const INSTRUMENT_TYPE_VALUES = [
  "prediction_market",
  "options",
  "crypto",
] as const;

export type InstrumentType = (typeof INSTRUMENT_TYPE_VALUES)[number];

export const STRATEGY_STATUS_VALUES = ["active", "paused", "archived"] as const;

export type StrategyStatus = (typeof STRATEGY_STATUS_VALUES)[number];

// ─── Common config sections (shared by all playbooks) ─────────────────────────

export const filtersSchema = z.object({
  keywords: z.array(z.string()).default([]),
  eventTypes: z.array(z.string()).default([]),
  minVolume: z.number().int().nonnegative().optional(),
  priceRangeMin: z.number().int().min(1).max(99).optional(),
  priceRangeMax: z.number().int().min(1).max(99).optional(),
});

export const entryRulesSchema = z.object({
  maxEntryPriceCents: z.number().int().min(1).max(99).optional(),
  minEdge: z.number().min(0).max(1).optional(),
  minTimeToExpiryHours: z.number().int().nonnegative().optional(),
});

export const exitRulesSchema = z.object({
  takeProfitCents: z.number().int().min(1).max(99).optional(),
  stopLossCents: z.number().int().min(1).max(99).optional(),
  timeStopHours: z.number().int().nonnegative().optional(),
  thesisInvalidation: z.string().optional(),
});

export const sizingSchema = z.object({
  maxPerTradeCents: z.number().int().positive().optional(),
  kellyFraction: z.number().min(0).max(1).default(0.5),
  budgetCapPct: z.number().min(0).max(100).default(100),
});

export const researchSchema = z.object({
  searchQueries: z.array(z.string()).default([]),
  sourcePriority: z.array(z.string()).default(["web", "x"]),
});

export const thesisTemplateSchema = z.object({
  requiredFields: z.array(z.string()).default(["thesis", "catalyst"]),
});

export const baseConfigSchema = z.object({
  filters: filtersSchema.default({}),
  entryRules: entryRulesSchema.default({}),
  exitRules: exitRulesSchema.default({}),
  sizing: sizingSchema.default({}),
  research: researchSchema.default({}),
  thesisTemplate: thesisTemplateSchema.default({}),
});

// ─── Playbook-specific extensions ─────────────────────────────────────────────

const eventDrivenExtSchema = z.object({
  catalystDate: z.string().optional(),
  catalystType: z.string().optional(),
  preVsPostPositioning: z.enum(["pre", "post", "both"]).default("pre"),
});

const relativeValueExtSchema = z.object({
  legDefinitions: z
    .array(
      z.object({
        ticker: z.string(),
        side: z.enum(["yes", "no"]),
        role: z.string(),
      })
    )
    .default([]),
  consistencyCheckType: z.string().optional(),
});

const tailRiskExtSchema = z.object({
  maxEntryCents: z.number().int().min(1).max(5).default(3),
  minDaysToExpiry: z.number().int().nonnegative().default(14),
  targetPortfolioSize: z.number().int().positive().default(10),
});

const momentumExtSchema = z.object({
  driftThresholdPts: z.number().positive().default(5),
  volumeIncreaseThreshold: z.number().min(0).default(1.5),
  lookbackDays: z.number().int().positive().default(7),
});

const meanReversionExtSchema = z.object({
  spikeThresholdPoints: z.number().positive().default(15),
  spikeWindowHours: z.number().int().positive().default(24),
  fadeTargetPct: z.number().min(0).max(100).default(50),
});

const macroThematicExtSchema = z.object({
  causalChain: z
    .array(
      z.object({
        link: z.string(),
        description: z.string().optional(),
      })
    )
    .default([]),
  perLinkAllocationPct: z.number().min(0).max(100).default(25),
});

// ─── Combined config schemas per playbook ─────────────────────────────────────

export const eventDrivenConfigSchema =
  baseConfigSchema.merge(eventDrivenExtSchema);
export const relativeValueConfigSchema = baseConfigSchema.merge(
  relativeValueExtSchema
);
export const tailRiskConfigSchema = baseConfigSchema.merge(tailRiskExtSchema);
export const momentumConfigSchema = baseConfigSchema.merge(momentumExtSchema);
export const meanReversionConfigSchema = baseConfigSchema.merge(
  meanReversionExtSchema
);
export const macroThematicConfigSchema = baseConfigSchema.merge(
  macroThematicExtSchema
);

// ─── Validation helpers ───────────────────────────────────────────────────────

const configSchemaByPlaybook: Record<Playbook, z.ZodType> = {
  event_driven: eventDrivenConfigSchema,
  relative_value: relativeValueConfigSchema,
  tail_risk: tailRiskConfigSchema,
  momentum: momentumConfigSchema,
  mean_reversion: meanReversionConfigSchema,
  macro_thematic: macroThematicConfigSchema,
};

/** Validate config JSON against the appropriate playbook schema. */
export function validateStrategyConfig(playbook: Playbook, config: unknown) {
  const schema = configSchemaByPlaybook[playbook];
  return schema.safeParse(config);
}

/** Parse with defaults — returns a fully populated config for the playbook. */
export function getDefaultConfig(playbook: Playbook): Record<string, unknown> {
  const schema = configSchemaByPlaybook[playbook];
  return schema.parse({}) as Record<string, unknown>;
}

export type StrategyConfig = z.infer<typeof baseConfigSchema> &
  Record<string, unknown>;
