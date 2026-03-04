import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  mockAuthenticatedSession,
  mockSession,
  mockUnauthenticatedSession,
} from "@/__tests__/helpers/auth";

// Mock dependencies
const mockAuth = vi.fn();
const mockGetChatsByUserId = vi.fn();
const mockDeleteAllChatsByUserId = vi.fn();

vi.mock("@/app/(auth)/auth", () => ({
  auth: (...args: any[]) => mockAuth(...args),
}));

vi.mock("@/lib/db/queries", () => ({
  getChatsByUserId: (...args: any[]) => mockGetChatsByUserId(...args),
  deleteAllChatsByUserId: (...args: any[]) =>
    mockDeleteAllChatsByUserId(...args),
}));

// The history route uses NextRequest, so we need to construct it properly.
// NextRequest extends Request but adds nextUrl. We can import it from next/server.
const { NextRequest } = await import("next/server");
const { GET, DELETE } = await import("../route");

function buildNextGet(
  path: string,
  params?: Record<string, string>
): InstanceType<typeof NextRequest> {
  const url = new URL(path, "http://localhost:3000");
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value);
    }
  }
  return new NextRequest(url.toString(), { method: "GET" });
}

describe("GET /api/history", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth.mockImplementation(mockAuthenticatedSession());
  });

  it("returns 401 when not authenticated", async () => {
    mockAuth.mockImplementation(mockUnauthenticatedSession());
    const res = await GET(buildNextGet("/api/history"));
    expect(res.status).toBe(401);
  });

  it("returns 400 when both starting_after and ending_before are provided", async () => {
    const res = await GET(
      buildNextGet("/api/history", {
        starting_after: "a",
        ending_before: "b",
      })
    );
    expect(res.status).toBe(400);
  });

  it("returns 200 with chats array on success", async () => {
    const chats = [{ id: "chat-1", title: "Test Chat" }];
    mockGetChatsByUserId.mockResolvedValue(chats);

    const res = await GET(buildNextGet("/api/history"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual(chats);
  });

  it("passes limit parameter to query", async () => {
    mockGetChatsByUserId.mockResolvedValue([]);
    await GET(buildNextGet("/api/history", { limit: "5" }));

    expect(mockGetChatsByUserId).toHaveBeenCalledWith(
      expect.objectContaining({
        id: mockSession.user.id,
        limit: 5,
      })
    );
  });
});

describe("DELETE /api/history", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth.mockImplementation(mockAuthenticatedSession());
  });

  it("returns 401 when not authenticated", async () => {
    mockAuth.mockImplementation(mockUnauthenticatedSession());
    const res = await DELETE();
    expect(res.status).toBe(401);
  });

  it("returns 200 with deletedCount on success", async () => {
    mockDeleteAllChatsByUserId.mockResolvedValue({ deletedCount: 3 });
    const res = await DELETE();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ deletedCount: 3 });
  });
});
