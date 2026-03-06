import { describe, expect, it, vi } from "vitest";
import {
  ChatbotError,
  type ErrorType,
  getMessageByErrorCode,
  visibilityBySurface,
} from "../errors";

// Suppress console.error from log-visibility toResponse calls
vi.mock("@/lib/logger", () => ({
  log: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

describe("ChatbotError", () => {
  it("parses error code into type and surface", () => {
    const err = new ChatbotError("not_found:chat");
    expect(err.type).toBe("not_found");
    expect(err.surface).toBe("chat");
  });

  it("sets the correct status code for each error type", () => {
    const cases: [ErrorType, number][] = [
      ["bad_request", 400],
      ["unauthorized", 401],
      ["forbidden", 403],
      ["not_found", 404],
      ["rate_limit", 429],
      ["offline", 503],
    ];

    for (const [type, expected] of cases) {
      const err = new ChatbotError(`${type}:chat`);
      expect(err.statusCode).toBe(expected);
    }
  });

  it("stores cause when provided", () => {
    const err = new ChatbotError("bad_request:api", "missing param");
    expect(err.cause).toBe("missing param");
  });
});

describe("ChatbotError.toResponse()", () => {
  it("returns Response with correct status code", () => {
    const err = new ChatbotError("not_found:chat");
    const res = err.toResponse();
    expect(res.status).toBe(404);
  });

  it("returns detailed message for response-visibility surfaces", async () => {
    const err = new ChatbotError("not_found:chat");
    const res = err.toResponse();
    const body = await res.json();
    expect(body.code).toBe("not_found:chat");
    expect(body.message).toBeTruthy();
  });

  it("returns generic message for database surface (log visibility)", async () => {
    const err = new ChatbotError("bad_request:database");
    const res = err.toResponse();
    const body = await res.json();
    // Database surface has "log" visibility — code is hidden from response
    expect(body.code).toBe("");
    expect(body.message).toContain("Something went wrong");
  });

  it("includes cause in response for response-visibility surfaces", async () => {
    const err = new ChatbotError("bad_request:api", "Invalid input");
    const res = err.toResponse();
    const body = await res.json();
    expect(body.cause).toBe("Invalid input");
  });
});

describe("getMessageByErrorCode", () => {
  it("returns a specific message for known error codes", () => {
    expect(getMessageByErrorCode("unauthorized:auth")).toContain("sign in");
  });

  it("returns database-specific message for database surface", () => {
    expect(getMessageByErrorCode("bad_request:database")).toContain("database");
  });

  it("returns a fallback for unknown error codes", () => {
    // @ts-expect-error — testing unknown code
    expect(getMessageByErrorCode("unknown:unknown")).toContain(
      "Something went wrong"
    );
  });
});

describe("visibilityBySurface", () => {
  it("database surface has log visibility", () => {
    expect(visibilityBySurface.database).toBe("log");
  });

  it("chat surface has response visibility", () => {
    expect(visibilityBySurface.chat).toBe("response");
  });

  it("all surfaces have a defined visibility", () => {
    for (const [, vis] of Object.entries(visibilityBySurface)) {
      expect(["response", "log", "none"]).toContain(vis);
    }
  });
});
