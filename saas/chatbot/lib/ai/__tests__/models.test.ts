import { describe, expect, it } from "vitest";
import { chatModels, DEFAULT_CHAT_MODEL, modelsByProvider } from "../models";

describe("chatModels", () => {
  it("every model has all required fields as non-empty strings", () => {
    for (const model of chatModels) {
      expect(model.id).toBeTruthy();
      expect(model.name).toBeTruthy();
      expect(model.provider).toBeTruthy();
      expect(model.description).toBeTruthy();
    }
  });

  it("has no duplicate model IDs", () => {
    const ids = chatModels.map((m) => m.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("DEFAULT_CHAT_MODEL exists in the chatModels array", () => {
    const ids = chatModels.map((m) => m.id);
    expect(ids).toContain(DEFAULT_CHAT_MODEL);
  });

  it("contains at least one model", () => {
    expect(chatModels.length).toBeGreaterThan(0);
  });
});

describe("modelsByProvider", () => {
  it("every provider key maps to a non-empty array", () => {
    for (const [provider, models] of Object.entries(modelsByProvider)) {
      expect(models.length).toBeGreaterThan(0);
      // Every model in the group has the correct provider
      for (const m of models) {
        expect(m.provider).toBe(provider);
      }
    }
  });

  it("all models appear in exactly one provider group", () => {
    const grouped = Object.values(modelsByProvider).flat();
    expect(grouped.length).toBe(chatModels.length);
  });

  it("contains known providers", () => {
    const providers = Object.keys(modelsByProvider);
    expect(providers).toContain("anthropic");
    expect(providers).toContain("openai");
    expect(providers).toContain("google");
  });
});
