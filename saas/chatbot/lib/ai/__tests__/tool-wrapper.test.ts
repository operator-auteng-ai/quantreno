import type { Tool } from "ai";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TOOL_CONFIG, type ToolAuditEntry, wrapTool } from "../tool-wrapper";

// Mock the AI generateText and provider functions
vi.mock("ai", async (importOriginal) => {
  const actual = await importOriginal<typeof import("ai")>();
  return {
    ...actual,
    generateText: vi.fn().mockResolvedValue({ text: "summarized content" }),
  };
});

vi.mock("@/lib/ai/providers", () => ({
  getTitleModel: vi.fn().mockReturnValue("mock-model"),
}));

vi.mock("@/lib/logger", () => ({
  log: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

// Helper to create a fake tool
function fakeTool(result: unknown): Tool {
  return {
    description: "test tool",
    parameters: { type: "object" as const, properties: {} },
    execute: vi.fn().mockResolvedValue(result),
  } as unknown as Tool;
}

describe("TOOL_CONFIG", () => {
  it("all configs have maxChars > 0", () => {
    for (const [, config] of Object.entries(TOOL_CONFIG)) {
      expect(config.maxChars).toBeGreaterThan(0);
    }
  });

  it("summarizable tools have a promptHint", () => {
    for (const [, config] of Object.entries(TOOL_CONFIG)) {
      if (config.summarizeAbove) {
        expect(config.promptHint).toBeTruthy();
      }
    }
  });

  it("webSearch has summarization enabled", () => {
    expect(TOOL_CONFIG.webSearch.summarizeAbove).toBeDefined();
    expect(TOOL_CONFIG.webSearch.maxChars).toBeGreaterThan(0);
  });

  it("createOrder has no summarization (small-response tool)", () => {
    expect(TOOL_CONFIG.createOrder.summarizeAbove).toBeUndefined();
    expect(TOOL_CONFIG.createOrder.maxChars).toBe(2000);
  });
});

describe("wrapTool", () => {
  let auditQueue: ToolAuditEntry[];

  beforeEach(() => {
    auditQueue = [];
    vi.clearAllMocks();
  });

  it("returns tool unchanged when tool has no execute function", () => {
    const tool = { description: "no-exec" } as unknown as Tool;
    const wrapped = wrapTool("test", tool, auditQueue);
    expect(wrapped).toBe(tool);
  });

  it("passes through small results unchanged", async () => {
    const tool = fakeTool({ data: "small" });
    const wrapped = wrapTool("test", tool, auditQueue, { maxChars: 10_000 });
    const result = await wrapped.execute?.({} as any, {} as any);

    expect(result).toEqual({ data: "small" });
  });

  it("pushes an audit entry after execution", async () => {
    const tool = fakeTool({ ok: true });
    const wrapped = wrapTool("test", tool, auditQueue, { maxChars: 10_000 });
    await wrapped.execute?.({} as any, {} as any);

    expect(auditQueue).toHaveLength(1);
    expect(auditQueue[0].toolName).toBe("test");
    expect(auditQueue[0].summarized).toBe(false);
    expect(auditQueue[0].durationMs).toBeGreaterThanOrEqual(0);
  });

  it("audit entry captures full result even when summarization occurs", async () => {
    const bigData = { data: "x".repeat(5000) };
    const tool = fakeTool(bigData);
    const wrapped = wrapTool("test", tool, auditQueue, {
      summarizeAbove: 100,
      maxChars: 20_000,
      promptHint: "test data",
    });
    await wrapped.execute?.({} as any, {} as any);

    expect(auditQueue[0].fullResult).toEqual(bigData);
    expect(auditQueue[0].summarized).toBe(true);
    expect(auditQueue[0].summaryChars).toBeGreaterThan(0);
  });

  it("triggers summarization when result exceeds summarizeAbove", async () => {
    const bigData = { data: "x".repeat(5000) };
    const tool = fakeTool(bigData);
    const wrapped = wrapTool("test", tool, auditQueue, {
      summarizeAbove: 100,
      maxChars: 20_000,
      promptHint: "test data",
    });
    const result = await wrapped.execute?.({} as any, {} as any);

    // Should return the summarized version
    expect(result).toEqual({
      _summarized: true,
      summary: "summarized content",
    });
  });

  it("applies hard cap when result exceeds maxChars", async () => {
    const bigData = { data: "x".repeat(5000) };
    const tool = fakeTool(bigData);
    const wrapped = wrapTool("test", tool, auditQueue, {
      maxChars: 100, // Very small cap, no summarization
    });
    const result = await wrapped.execute?.({} as any, {} as any);

    // Should be truncated
    expect(result).toHaveProperty("_truncated", true);
    const resultStr = (result as any).data;
    expect(resultStr).toContain("...[truncated]");
  });

  it("uses default config from TOOL_CONFIG when name matches", async () => {
    const tool = fakeTool({ ok: true });
    const wrapped = wrapTool("createOrder", tool, auditQueue);
    await wrapped.execute?.({} as any, {} as any);

    // createOrder has maxChars: 2000 in TOOL_CONFIG
    expect(auditQueue[0].toolName).toBe("createOrder");
  });

  it("uses fallback config when tool name not in TOOL_CONFIG and no config provided", async () => {
    const tool = fakeTool({ ok: true });
    const wrapped = wrapTool("unknownTool", tool, auditQueue);
    await wrapped.execute?.({} as any, {} as any);

    // Should still work with fallback { maxChars: 4_000 }
    expect(auditQueue[0].toolName).toBe("unknownTool");
  });

  it("records correct input args in audit entry", async () => {
    const tool = fakeTool({ ok: true });
    const wrapped = wrapTool("test", tool, auditQueue, { maxChars: 10_000 });
    const args = { query: "test query", limit: 10 };
    await wrapped.execute?.(args as any, {} as any);

    expect(auditQueue[0].input).toEqual(args);
  });

  it("records resultChars matching the full result JSON length", async () => {
    const data = { items: [1, 2, 3] };
    const tool = fakeTool(data);
    const wrapped = wrapTool("test", tool, auditQueue, { maxChars: 10_000 });
    await wrapped.execute?.({} as any, {} as any);

    expect(auditQueue[0].resultChars).toBe(JSON.stringify(data).length);
  });
});
