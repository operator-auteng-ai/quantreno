import { beforeEach, describe, expect, it, vi } from "vitest";
import { mockSession } from "@/__tests__/helpers/auth";

// ─── Mocks ──────────────────────────────────────────────────────────────────

const mockGetStrategiesByUserId = vi.fn();
const mockGetStrategyTradeStats = vi.fn();

vi.mock("@/lib/db/queries", () => ({
  getStrategiesByUserId: (...args: any[]) =>
    mockGetStrategiesByUserId(...args),
  getStrategyTradeStats: (...args: any[]) =>
    mockGetStrategyTradeStats(...args),
}));

vi.mock("@/lib/logger", () => ({
  log: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

// ─── Import after mocks ─────────────────────────────────────────────────────

const { listStrategies } = await import("../list-strategies");

// ─── Fixtures ───────────────────────────────────────────────────────────────

const now = new Date();
const fakeStrategy = {
  id: "strat-001",
  userId: mockSession.user.id,
  name: "Oil Supply Chain",
  playbook: "event_driven",
  instrumentType: "prediction_market",
  budgetCents: 10000,
  config: {},
  status: "active",
  createdAt: now,
  updatedAt: now,
};

const session = { ...mockSession } as any;

// ─── Tests ──────────────────────────────────────────────────────────────────

describe("listStrategies tool", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetStrategiesByUserId.mockResolvedValue([fakeStrategy]);
    mockGetStrategyTradeStats.mockResolvedValue([
      { strategyId: "strat-001", openCount: 3 },
    ]);
  });

  it("returns strategies with trade stats enrichment", async () => {
    const tool = listStrategies({ session });
    const result = await (tool.execute as any)({} as any, {} as any);

    expect(result.strategies).toHaveLength(1);
    expect(result.strategies[0].name).toBe("Oil Supply Chain");
    expect(result.strategies[0].budgetDollars).toBe("100.00");
    expect(result.strategies[0].openPositions).toBe(3);
    expect(result.total).toBe(1);
  });

  it("passes status filter to query", async () => {
    const tool = listStrategies({ session });
    await (tool.execute as any)({ status: "paused" } as any, {} as any);

    expect(mockGetStrategiesByUserId).toHaveBeenCalledWith(
      expect.objectContaining({ status: "paused" })
    );
  });

  it("returns 0 open positions when strategy has no trades", async () => {
    mockGetStrategyTradeStats.mockResolvedValue([]);

    const tool = listStrategies({ session });
    const result = await (tool.execute as any)({} as any, {} as any);

    expect(result.strategies[0].openPositions).toBe(0);
  });

  it("returns empty list when user has no strategies", async () => {
    mockGetStrategiesByUserId.mockResolvedValue([]);
    mockGetStrategyTradeStats.mockResolvedValue([]);

    const tool = listStrategies({ session });
    const result = await (tool.execute as any)({} as any, {} as any);

    expect(result.strategies).toEqual([]);
    expect(result.total).toBe(0);
  });

  it("returns error result on db failure", async () => {
    mockGetStrategiesByUserId.mockRejectedValue(new Error("DB down"));

    const tool = listStrategies({ session });
    const result = await (tool.execute as any)({} as any, {} as any);

    expect(result.error).toBe("Failed to list strategies");
    expect(result.strategies).toEqual([]);
  });
});
