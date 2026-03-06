import { describe, expect, it } from "vitest";
import {
  PLAYBOOK_VALUES,
  INSTRUMENT_TYPE_VALUES,
  STRATEGY_STATUS_VALUES,
  validateStrategyConfig,
  getDefaultConfig,
  baseConfigSchema,
  eventDrivenConfigSchema,
  tailRiskConfigSchema,
  macroThematicConfigSchema,
  type Playbook,
} from "../playbook-schemas";

describe("enums", () => {
  it("PLAYBOOK_VALUES has 6 playbooks", () => {
    expect(PLAYBOOK_VALUES).toHaveLength(6);
    expect(PLAYBOOK_VALUES).toContain("event_driven");
    expect(PLAYBOOK_VALUES).toContain("relative_value");
    expect(PLAYBOOK_VALUES).toContain("tail_risk");
    expect(PLAYBOOK_VALUES).toContain("momentum");
    expect(PLAYBOOK_VALUES).toContain("mean_reversion");
    expect(PLAYBOOK_VALUES).toContain("macro_thematic");
  });

  it("INSTRUMENT_TYPE_VALUES has 3 types", () => {
    expect(INSTRUMENT_TYPE_VALUES).toHaveLength(3);
    expect(INSTRUMENT_TYPE_VALUES).toContain("prediction_market");
  });

  it("STRATEGY_STATUS_VALUES has 3 statuses", () => {
    expect(STRATEGY_STATUS_VALUES).toHaveLength(3);
    expect(STRATEGY_STATUS_VALUES).toContain("active");
    expect(STRATEGY_STATUS_VALUES).toContain("paused");
    expect(STRATEGY_STATUS_VALUES).toContain("archived");
  });
});

describe("baseConfigSchema", () => {
  it("fills all defaults from empty object", () => {
    const result = baseConfigSchema.parse({});
    expect(result.filters).toBeDefined();
    expect(result.filters.keywords).toEqual([]);
    expect(result.entryRules).toBeDefined();
    expect(result.exitRules).toBeDefined();
    expect(result.sizing).toBeDefined();
    expect(result.sizing.kellyFraction).toBe(0.5);
    expect(result.sizing.budgetCapPct).toBe(100);
    expect(result.research).toBeDefined();
    expect(result.research.sourcePriority).toEqual(["web", "x"]);
    expect(result.thesisTemplate).toBeDefined();
    expect(result.thesisTemplate.requiredFields).toEqual([
      "thesis",
      "catalyst",
    ]);
  });

  it("accepts partial overrides", () => {
    const result = baseConfigSchema.parse({
      filters: { keywords: ["oil", "crude"] },
      sizing: { kellyFraction: 0.25 },
    });
    expect(result.filters.keywords).toEqual(["oil", "crude"]);
    expect(result.sizing.kellyFraction).toBe(0.25);
    // other defaults still applied
    expect(result.sizing.budgetCapPct).toBe(100);
  });
});

describe("eventDrivenConfigSchema", () => {
  it("includes base + extension defaults", () => {
    const result = eventDrivenConfigSchema.parse({});
    expect(result.preVsPostPositioning).toBe("pre");
    expect(result.filters).toBeDefined();
  });

  it("accepts catalyst fields", () => {
    const result = eventDrivenConfigSchema.parse({
      catalystDate: "2026-03-15",
      catalystType: "data_release",
    });
    expect(result.catalystDate).toBe("2026-03-15");
    expect(result.catalystType).toBe("data_release");
  });
});

describe("tailRiskConfigSchema", () => {
  it("defaults maxEntryCents to 3", () => {
    const result = tailRiskConfigSchema.parse({});
    expect(result.maxEntryCents).toBe(3);
    expect(result.minDaysToExpiry).toBe(14);
    expect(result.targetPortfolioSize).toBe(10);
  });

  it("rejects maxEntryCents > 5", () => {
    const result = tailRiskConfigSchema.safeParse({ maxEntryCents: 10 });
    expect(result.success).toBe(false);
  });
});

describe("macroThematicConfigSchema", () => {
  it("defaults causalChain to empty array", () => {
    const result = macroThematicConfigSchema.parse({});
    expect(result.causalChain).toEqual([]);
    expect(result.perLinkAllocationPct).toBe(25);
  });

  it("accepts causal chain links", () => {
    const result = macroThematicConfigSchema.parse({
      causalChain: [
        { link: "Tariffs", description: "New tariffs on imports" },
        { link: "CPI spike" },
      ],
    });
    expect(result.causalChain).toHaveLength(2);
    expect(result.causalChain[0].link).toBe("Tariffs");
  });
});

describe("validateStrategyConfig", () => {
  it("succeeds for valid empty config on each playbook", () => {
    for (const playbook of PLAYBOOK_VALUES) {
      const result = validateStrategyConfig(playbook, {});
      expect(result.success).toBe(true);
    }
  });

  it("returns error for invalid entry rule values", () => {
    const result = validateStrategyConfig("event_driven", {
      entryRules: { maxEntryPriceCents: 200 }, // max is 99
    });
    expect(result.success).toBe(false);
  });

  it("validates playbook-specific fields correctly", () => {
    const result = validateStrategyConfig("tail_risk", {
      maxEntryCents: 2,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.maxEntryCents).toBe(2);
    }
  });
});

describe("getDefaultConfig", () => {
  it("returns a valid config for each playbook", () => {
    for (const playbook of PLAYBOOK_VALUES) {
      const config = getDefaultConfig(playbook);
      expect(config).toBeDefined();
      expect(config.filters).toBeDefined();
      expect(config.sizing).toBeDefined();
    }
  });

  it("includes playbook-specific defaults", () => {
    const tailConfig = getDefaultConfig("tail_risk");
    expect(tailConfig.maxEntryCents).toBe(3);

    const eventConfig = getDefaultConfig("event_driven");
    expect(eventConfig.preVsPostPositioning).toBe("pre");

    const macroConfig = getDefaultConfig("macro_thematic");
    expect(macroConfig.causalChain).toEqual([]);
  });

  it("returned config passes validation", () => {
    for (const playbook of PLAYBOOK_VALUES) {
      const config = getDefaultConfig(playbook);
      const result = validateStrategyConfig(playbook, config);
      expect(result.success).toBe(true);
    }
  });
});
