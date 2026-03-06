import { beforeEach, describe, expect, it, vi } from "vitest";
import { mockSession } from "@/__tests__/helpers/auth";

// ─── Mocks ──────────────────────────────────────────────────────────────────

const mockDbCreateStrategy = vi.fn();

vi.mock("@/lib/db/queries", () => ({
  createStrategy: (...args: any[]) => mockDbCreateStrategy(...args),
}));

vi.mock("@/lib/logger", () => ({
  log: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

// ─── Import after mocks ─────────────────────────────────────────────────────

const { createStrategy } = await import("../create-strategy");

// ─── Fixtures ───────────────────────────────────────────────────────────────

const now = new Date();
const session = { ...mockSession } as any;

function fakeDbStrategy(overrides: Record<string, any> = {}) {
  return {
    id: "strat-new",
    userId: mockSession.user.id,
    name: "Test Strategy",
    playbook: "event_driven",
    instrumentType: "prediction_market",
    budgetCents: 5000,
    config: {},
    status: "active",
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

// ─── Tests ──────────────────────────────────────────────────────────────────

describe("createStrategy tool", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDbCreateStrategy.mockResolvedValue(fakeDbStrategy());
  });

  it("creates a strategy with defaults merged", async () => {
    const tool = createStrategy({ session });
    const result = await (tool.execute as any)(
      {
        name: "Test Strategy",
        playbook: "event_driven",
        instrumentType: "prediction_market",
        budgetCents: 5000,
        config: {},
      } as any,
      {} as any
    );

    expect(result.success).toBe(true);
    expect(result.strategy.id).toBe("strat-new");
    expect(result.strategy.budgetDollars).toBe("50.00");

    // Verify DB was called with merged config (not empty)
    const dbCall = mockDbCreateStrategy.mock.calls[0][0];
    expect(dbCall.config).toBeDefined();
    expect(dbCall.config.filters).toBeDefined();
    expect(dbCall.config.sizing).toBeDefined();
    expect(dbCall.config.sizing.kellyFraction).toBe(0.5);
  });

  it("merges user config with playbook defaults", async () => {
    const tool = createStrategy({ session });
    await (tool.execute as any)(
      {
        name: "Tail Risk Portfolio",
        playbook: "tail_risk",
        instrumentType: "prediction_market",
        budgetCents: 2000,
        config: { maxEntryCents: 2 },
      } as any,
      {} as any
    );

    const dbCall = mockDbCreateStrategy.mock.calls[0][0];
    expect(dbCall.config.maxEntryCents).toBe(2); // user override
    expect(dbCall.config.minDaysToExpiry).toBe(14); // playbook default
    expect(dbCall.config.targetPortfolioSize).toBe(10); // playbook default
  });

  it("returns error for invalid config", async () => {
    const tool = createStrategy({ session });
    const result = await (tool.execute as any)(
      {
        name: "Bad Config",
        playbook: "tail_risk",
        instrumentType: "prediction_market",
        budgetCents: 5000,
        config: { maxEntryCents: 99 }, // max is 5
      } as any,
      {} as any
    );

    expect(result.success).toBe(false);
    expect(result.error).toContain("Invalid config");
    expect(mockDbCreateStrategy).not.toHaveBeenCalled();
  });

  it("returns error on db failure", async () => {
    mockDbCreateStrategy.mockRejectedValue(new Error("insert failed"));

    const tool = createStrategy({ session });
    const result = await (tool.execute as any)(
      {
        name: "Failing Strategy",
        playbook: "event_driven",
        instrumentType: "prediction_market",
        budgetCents: 5000,
        config: {},
      } as any,
      {} as any
    );

    expect(result.success).toBe(false);
    expect(result.error).toBe("insert failed");
  });

  it("sets correct playbook-specific defaults for macro_thematic", async () => {
    mockDbCreateStrategy.mockResolvedValue(
      fakeDbStrategy({ playbook: "macro_thematic" })
    );

    const tool = createStrategy({ session });
    await (tool.execute as any)(
      {
        name: "Macro Chain",
        playbook: "macro_thematic",
        instrumentType: "prediction_market",
        budgetCents: 10000,
        config: {
          causalChain: [{ link: "Tariffs" }, { link: "CPI" }],
        },
      } as any,
      {} as any
    );

    const dbCall = mockDbCreateStrategy.mock.calls[0][0];
    expect(dbCall.config.causalChain).toHaveLength(2);
    expect(dbCall.config.perLinkAllocationPct).toBe(25); // default
  });
});
