import { describe, expect, it } from "vitest";
import {
  artifactsPrompt,
  regularPrompt,
  systemPrompt,
  titlePrompt,
  updateDocumentPrompt,
} from "../prompts";

describe("systemPrompt", () => {
  it("returns a non-empty string", () => {
    const result = systemPrompt({
      selectedChatModel: "anthropic/claude-haiku-4.5",
    });
    expect(result.length).toBeGreaterThan(0);
  });

  it("includes regularPrompt content", () => {
    const result = systemPrompt({
      selectedChatModel: "anthropic/claude-haiku-4.5",
    });
    expect(result).toContain("Quantreno");
  });

  it("includes artifactsPrompt for standard models", () => {
    const result = systemPrompt({
      selectedChatModel: "anthropic/claude-haiku-4.5",
    });
    expect(result).toContain(artifactsPrompt);
  });

  it("excludes artifactsPrompt for thinking models", () => {
    const result = systemPrompt({
      selectedChatModel: "anthropic/claude-3.7-sonnet-thinking",
    });
    expect(result).not.toContain(artifactsPrompt);
  });

  it("excludes artifactsPrompt for reasoning models", () => {
    const result = systemPrompt({
      selectedChatModel: "xai/grok-code-fast-1-reasoning",
    });
    expect(result).not.toContain(artifactsPrompt);
  });

  it("includes sessionContext when provided", () => {
    const result = systemPrompt({
      selectedChatModel: "anthropic/claude-haiku-4.5",
      sessionContext: "Open positions: AAPL 100 shares",
    });
    expect(result).toContain("Open positions: AAPL 100 shares");
    expect(result).toContain("Current session context");
  });

  it("does not include session context header when sessionContext is undefined", () => {
    const result = systemPrompt({
      selectedChatModel: "anthropic/claude-haiku-4.5",
    });
    expect(result).not.toContain("Current session context");
  });
});

describe("updateDocumentPrompt", () => {
  it("returns 'document' for text type", () => {
    const result = updateDocumentPrompt("content here", "text");
    expect(result).toContain("document");
    expect(result).not.toContain("code snippet");
  });

  it("returns 'code snippet' for code type", () => {
    const result = updateDocumentPrompt("content here", "code");
    expect(result).toContain("code snippet");
  });

  it("returns 'spreadsheet' for sheet type", () => {
    const result = updateDocumentPrompt("content here", "sheet");
    expect(result).toContain("spreadsheet");
  });

  it("includes currentContent in output", () => {
    const result = updateDocumentPrompt("my special content", "text");
    expect(result).toContain("my special content");
  });
});

describe("static prompts", () => {
  it("regularPrompt is a non-empty string", () => {
    expect(regularPrompt.length).toBeGreaterThan(0);
  });

  it("artifactsPrompt is a non-empty string", () => {
    expect(artifactsPrompt.length).toBeGreaterThan(0);
  });

  it("titlePrompt is a non-empty string", () => {
    expect(titlePrompt.length).toBeGreaterThan(0);
  });
});
