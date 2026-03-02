/**
 * Two-phase tool result pipeline:
 *   1. Tool executes → full result captured for audit
 *   2. If result is large, a cheap model summarizes it before the main model sees it
 *   3. Hard maxChars safety net as last resort
 *
 * This dramatically reduces token input to the main model without losing signal.
 */
import { generateText, type Tool } from "ai";
import { log } from "@/lib/logger";
import { getTitleModel } from "./providers";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ToolAuditEntry {
  toolName: string;
  input: unknown;
  fullResult: unknown;
  resultChars: number;
  summarized: boolean;
  summaryChars: number | null;
  durationMs: number;
}

interface ToolWrapConfig {
  /** Summarize when result JSON exceeds this many chars (skip if undefined) */
  summarizeAbove?: number;
  /** Hard character cap — emergency safety net */
  maxChars: number;
  /** Hint for the summarizer about what data matters */
  promptHint?: string;
}

// ─── Per-tool configuration ──────────────────────────────────────────────────

export const TOOL_CONFIG: Record<string, ToolWrapConfig> = {
  webSearch: {
    summarizeAbove: 3_000,
    maxChars: 8_000,
    promptHint:
      "news/research results — keep headlines, key facts, dates, and source URLs",
  },
  xSearch: {
    summarizeAbove: 3_000,
    maxChars: 8_000,
    promptHint:
      "tweets — keep sentiment, key opinions, notable authors, engagement counts",
  },
  getMarkets: {
    summarizeAbove: 4_000,
    maxChars: 10_000,
    promptHint:
      "market listings — keep tickers, titles, yes/no prices, volume, close dates",
  },
  getPositions: {
    summarizeAbove: 3_000,
    maxChars: 6_000,
    promptHint:
      "portfolio positions — keep ALL tickers, sides, contract counts, P&L",
  },
  getPortfolio: {
    summarizeAbove: 3_000,
    maxChars: 6_000,
    promptHint:
      "portfolio summary — keep balance, ALL position details, total P&L",
  },
  getTradeHistory: {
    summarizeAbove: 3_000,
    maxChars: 6_000,
    promptHint: "trade history — keep dates, tickers, sides, P&L per trade",
  },
  // Small-response tools — no summarization, just safety cap
  createOrder: { maxChars: 2_000 },
  cancelOrder: { maxChars: 2_000 },
  createDocument: { maxChars: 2_000 },
  updateDocument: { maxChars: 2_000 },
  requestSuggestions: { maxChars: 2_000 },
};

// ─── Summarizer ──────────────────────────────────────────────────────────────

const SUMMARIZER_SYSTEM = `You are a data summarizer for a trading assistant. Distill the following tool output into a concise summary preserving all actionable data points. Keep tickers, prices, dates, sentiment, and key metrics. Output plain text, no markdown headers. No preamble.`;

async function summarizeResult(
  toolName: string,
  json: string,
  promptHint: string
): Promise<string> {
  try {
    const { text } = await generateText({
      model: getTitleModel(),
      system: SUMMARIZER_SYSTEM,
      prompt: `Tool: ${toolName}\nFocus: ${promptHint}\n\nData:\n${json}`,
    });
    return text;
  } catch (err) {
    log.warn("tool-wrapper", "summarization failed, using truncation", {
      toolName,
      error: err instanceof Error ? err.message : String(err),
    });
    // Fallback: hard truncate
    return json.slice(0, 4_000) + "\n...[truncated]";
  }
}

// ─── Wrapper ─────────────────────────────────────────────────────────────────

/**
 * Wraps a tool to:
 *  - time execution
 *  - capture full result for audit
 *  - summarize large results via cheap model
 *  - hard-cap as safety net
 */
export function wrapTool<T extends Tool>(
  toolName: string,
  tool: T,
  auditQueue: ToolAuditEntry[],
  config?: ToolWrapConfig
): T {
  const cfg = config ?? TOOL_CONFIG[toolName] ?? { maxChars: 4_000 };

  // Clone tool and override execute
  const wrapped = { ...tool } as T;

  const originalExecute = tool.execute;
  if (!originalExecute) return tool; // no execute = nothing to wrap

  wrapped.execute = async (args: any, execOptions: any) => {
    const startMs = Date.now();
    const fullResult = await originalExecute(args, execOptions);
    const durationMs = Date.now() - startMs;

    const fullJson = JSON.stringify(fullResult);
    const resultChars = fullJson.length;

    let summarized = false;
    let summaryChars: number | null = null;
    let returnValue: unknown = fullResult;

    // Phase 1: Summarize if large and config allows
    if (cfg.summarizeAbove && resultChars > cfg.summarizeAbove && cfg.promptHint) {
      const summary = await summarizeResult(toolName, fullJson, cfg.promptHint);
      summarized = true;
      summaryChars = summary.length;
      returnValue = { _summarized: true, summary };

      log.info("tool-wrapper", "summarized", {
        toolName,
        originalChars: resultChars,
        summaryChars,
      });
    }

    // Phase 2: Hard cap safety net
    const returnJson = JSON.stringify(returnValue);
    if (returnJson.length > cfg.maxChars) {
      const truncated = returnJson.slice(0, cfg.maxChars) + "...[truncated]";
      returnValue = { _truncated: true, data: truncated };
      summaryChars = truncated.length;
      if (!summarized) summarized = true; // mark as modified

      log.warn("tool-wrapper", "hard-capped", {
        toolName,
        maxChars: cfg.maxChars,
        actualChars: returnJson.length,
      });
    }

    // Push audit entry (consumed by onStepFinish in route.ts)
    auditQueue.push({
      toolName,
      input: args,
      fullResult,
      resultChars,
      summarized,
      summaryChars,
      durationMs,
    });

    return returnValue;
  };

  return wrapped;
}
