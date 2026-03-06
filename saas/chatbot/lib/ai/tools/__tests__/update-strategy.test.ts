import { beforeEach, describe, expect, it, vi } from "vitest";
import { mockSession } from "@/__tests__/helpers/auth";

// ─── Mocks ──────────────────────────────────────────────────────────────────

const mockGetStrategyById = vi.fn();
const mockDbUpdateStrategy = vi.fn();

vi.mock("@/lib/db/queries", () => ({
  getStrategyById: (...args: any[]) => mockGetStrategyById(...args),
  updateStrategy: (...args: any[]) => mockDbUpdateStrategy(...args),
}));

vi.mock("@/lib/logger", () => ({
  log: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

// ─── Import after mocks ─────────────────────────────────────────────────────

const { updateStrategy } = await import("../update-strategy");

// ─── Fixtures ───────────────────────────────────────────────────────────────

const now = new Date();
const session = { ...mockSession } as any;

const existingStrategy = {
  id: "strat-001",
  userId: mockSession.user.id,
  name: "Old Name",
  playbook: "event_driven",
  instrumentType: "prediction_market",
  budgetCents: 5000,
  config: {
    filters: { keywords: [], eventTypes: [] },
    entryRules: {},
    exitRules: {},
    sizing: { kellyFraction: 0.5, budgetCapPct: 100 },
    research: { searchQueries: [], sourcePriority: ["web", "x"] },
    thesisTemplate: { requiredFields: ["thesis", "catalyst"] },
    preVsPostPositioning: "pre",
  },
  status: "active",
  createdAt: now,
  updatedAt: now,
};

// ─── Tests ──────────────────────────────────────────────────────────────────

describe("updateStrategy tool", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetStrategyById.mockResolvedValue(existingStrategy);
    mockDbUpdateStrategy.mockResolvedValue({
      ...existingStrategy,
      name: "New Name",
      updatedAt: new Date(),
    });
  });

  it("updates strategy name", async () => {
    const tool = updateStrategy({ session });
    const result = await (tool.execute as any)(
      { strategyId: "strat-001", name: "New Name" } as any,
      {} as any
    );

    expect(result.success).toBe(true);
    expect(result.strategy.name).toBe("New Name");
    expect(mockDbUpdateStrategy).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "strat-001",
        updates: expect.objectContaining({ name: "New Name" }),
      })
    );
  });

  it("updates budget", async () => {
    mockDbUpdateStrategy.mockResolvedValue({
      ...existingStrategy,
      budgetCents: 20000,
      updatedAt: new Date(),
    });

    const tool = updateStrategy({ session });
    const result = await (tool.execute as any)(
      { strategyId: "strat-001", budgetCents: 20000 } as any,
      {} as any
    );

    expect(result.success).toBe(true);
    expect(result.strategy.budgetDollars).toBe("200.00");
  });

  it("pauses a strategy", async () => {
    mockDbUpdateStrategy.mockResolvedValue({
      ...existingStrategy,
      status: "paused",
      updatedAt: new Date(),
    });

    const tool = updateStrategy({ session });
    const result = await (tool.execute as any)(
      { strategyId: "strat-001", status: "paused" } as any,
      {} as any
    );

    expect(result.success).toBe(true);
    expect(result.strategy.status).toBe("paused");
  });

  it("merges and validates config updates", async () => {
    mockDbUpdateStrategy.mockResolvedValue({
      ...existingStrategy,
      config: {
        ...existingStrategy.config,
        catalystDate: "2026-03-15",
      },
      updatedAt: new Date(),
    });

    const tool = updateStrategy({ session });
    const result = await (tool.execute as any)(
      {
        strategyId: "strat-001",
        config: { catalystDate: "2026-03-15" },
      } as any,
      {} as any
    );

    expect(result.success).toBe(true);

    // Verify config was merged (not replaced)
    const dbCall = mockDbUpdateStrategy.mock.calls[0][0];
    expect(dbCall.updates.config.catalystDate).toBe("2026-03-15");
    // Original fields should still be present in merged config
    expect(dbCall.updates.config.filters).toBeDefined();
  });

  it("returns error when strategy not found", async () => {
    mockGetStrategyById.mockResolvedValue(null);

    const tool = updateStrategy({ session });
    const result = await (tool.execute as any)(
      { strategyId: "strat-999", name: "Ghost" } as any,
      {} as any
    );

    expect(result.success).toBe(false);
    expect(result.error).toContain("not found");
    expect(mockDbUpdateStrategy).not.toHaveBeenCalled();
  });

  it("returns error when no fields to update", async () => {
    const tool = updateStrategy({ session });
    const result = await (tool.execute as any)(
      { strategyId: "strat-001" } as any,
      {} as any
    );

    expect(result.success).toBe(false);
    expect(result.error).toContain("No fields to update");
  });

  it("rejects invalid config for the playbook", async () => {
    const tool = updateStrategy({ session });
    const result = await (tool.execute as any)(
      {
        strategyId: "strat-001",
        config: { entryRules: { maxEntryPriceCents: 200 } }, // max is 99
      } as any,
      {} as any
    );

    expect(result.success).toBe(false);
    expect(result.error).toContain("Invalid config");
    expect(mockDbUpdateStrategy).not.toHaveBeenCalled();
  });

  it("returns error on db failure", async () => {
    mockDbUpdateStrategy.mockRejectedValue(new Error("update failed"));

    const tool = updateStrategy({ session });
    const result = await (tool.execute as any)(
      { strategyId: "strat-001", name: "Failing" } as any,
      {} as any
    );

    expect(result.success).toBe(false);
    expect(result.error).toBe("update failed");
  });

  it("returns error when dbUpdate returns null", async () => {
    mockDbUpdateStrategy.mockResolvedValue(null);

    const tool = updateStrategy({ session });
    const result = await (tool.execute as any)(
      { strategyId: "strat-001", name: "Failing" } as any,
      {} as any
    );

    expect(result.success).toBe(false);
    expect(result.error).toBe("Update failed.");
  });
});
