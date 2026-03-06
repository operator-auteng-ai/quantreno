import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  mockAuthenticatedSession,
  mockUnauthenticatedSession,
} from "@/__tests__/helpers/auth";
import { buildJson } from "@/__tests__/helpers/request";

// Mock dependencies
const mockAuth = vi.fn();
const mockGetKalshiCredentialByUserId = vi.fn();
const mockUpsertKalshiCredential = vi.fn();
const mockDeleteKalshiCredential = vi.fn();

vi.mock("@/app/(auth)/auth", () => ({
  auth: (...args: any[]) => mockAuth(...args),
}));

vi.mock("@/lib/db/queries", () => ({
  getKalshiCredentialByUserId: (...args: any[]) =>
    mockGetKalshiCredentialByUserId(...args),
  upsertKalshiCredential: (...args: any[]) =>
    mockUpsertKalshiCredential(...args),
  deleteKalshiCredential: (...args: any[]) =>
    mockDeleteKalshiCredential(...args),
}));

vi.mock("@/lib/kalshi/encrypt", () => ({
  encrypt: vi.fn().mockReturnValue("encrypted-value"),
}));

const mockGetBalance = vi.fn();
vi.mock("@/lib/kalshi/client", () => ({
  createKalshiClient: vi.fn().mockReturnValue({
    getBalance: (...args: any[]) => mockGetBalance(...args),
  }),
}));

vi.mock("@/lib/logger", () => ({
  log: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

const { GET, POST, DELETE } = await import("../route");

describe("GET /api/kalshi/credentials", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth.mockImplementation(mockAuthenticatedSession());
  });

  it("returns 401 when not authenticated", async () => {
    mockAuth.mockImplementation(mockUnauthenticatedSession());
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it("returns connected: false when no credentials exist", async () => {
    mockGetKalshiCredentialByUserId.mockResolvedValue(null);
    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ connected: false });
  });

  it("returns connected: true with metadata when credentials exist", async () => {
    const now = new Date();
    mockGetKalshiCredentialByUserId.mockResolvedValue({
      lastUsedAt: now,
      createdAt: now,
    });
    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.connected).toBe(true);
    expect(body.lastUsedAt).toBeDefined();
    expect(body.createdAt).toBeDefined();
  });
});

describe("POST /api/kalshi/credentials", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth.mockImplementation(mockAuthenticatedSession());
  });

  it("returns 401 when not authenticated", async () => {
    mockAuth.mockImplementation(mockUnauthenticatedSession());
    const res = await POST(
      buildJson("POST", "/api/kalshi/credentials", {
        apiKey: "key",
        privateKeyPem: "-----BEGIN PRIVATE KEY-----\ntest",
      })
    );
    expect(res.status).toBe(401);
  });

  it("returns 400 on invalid body (missing apiKey)", async () => {
    const res = await POST(
      buildJson("POST", "/api/kalshi/credentials", {
        privateKeyPem: "-----BEGIN PRIVATE KEY-----\ntest",
      })
    );
    expect(res.status).toBe(400);
  });

  it("returns 400 when privateKeyPem is missing BEGIN marker", async () => {
    const res = await POST(
      buildJson("POST", "/api/kalshi/credentials", {
        apiKey: "test-key",
        privateKeyPem: "not-a-pem",
      })
    );
    expect(res.status).toBe(400);
  });

  it("returns 422 when Kalshi connection test fails", async () => {
    mockGetBalance.mockRejectedValue(new Error("Invalid credentials"));

    const res = await POST(
      buildJson("POST", "/api/kalshi/credentials", {
        apiKey: "test-key",
        privateKeyPem: "-----BEGIN PRIVATE KEY-----\ntest",
      })
    );
    expect(res.status).toBe(422);
    const body = await res.json();
    expect(body.error).toContain("Invalid credentials");
  });

  it("returns connected: true with balance on success", async () => {
    mockGetBalance.mockResolvedValue({ balance: 50_000 });
    mockUpsertKalshiCredential.mockResolvedValue(undefined);

    const res = await POST(
      buildJson("POST", "/api/kalshi/credentials", {
        apiKey: "test-key",
        privateKeyPem: "-----BEGIN PRIVATE KEY-----\ntest",
      })
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ connected: true, balance: 50_000 });
  });
});

describe("DELETE /api/kalshi/credentials", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth.mockImplementation(mockAuthenticatedSession());
  });

  it("returns 401 when not authenticated", async () => {
    mockAuth.mockImplementation(mockUnauthenticatedSession());
    const res = await DELETE();
    expect(res.status).toBe(401);
  });

  it("returns connected: false on success", async () => {
    mockDeleteKalshiCredential.mockResolvedValue(undefined);
    const res = await DELETE();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ connected: false });
  });
});
