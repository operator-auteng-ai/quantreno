import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  mockAuthenticatedSession,
  mockSession,
  mockUnauthenticatedSession,
} from "@/__tests__/helpers/auth";
import { buildGet, buildJson } from "@/__tests__/helpers/request";

// Mock dependencies before importing route handlers
const mockAuth = vi.fn();
const mockGetChatById = vi.fn();
const mockGetVotesByChatId = vi.fn();
const mockVoteMessage = vi.fn();

vi.mock("@/app/(auth)/auth", () => ({
  auth: (...args: any[]) => mockAuth(...args),
}));

vi.mock("@/lib/db/queries", () => ({
  getChatById: (...args: any[]) => mockGetChatById(...args),
  getVotesByChatId: (...args: any[]) => mockGetVotesByChatId(...args),
  voteMessage: (...args: any[]) => mockVoteMessage(...args),
}));

// Import handlers after mocks are set up
const { GET, PATCH } = await import("../route");

describe("GET /api/vote", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth.mockImplementation(mockAuthenticatedSession());
  });

  it("returns 400 when chatId is missing", async () => {
    const res = await GET(buildGet("/api/vote"));
    expect(res.status).toBe(400);
  });

  it("returns 401 when not authenticated", async () => {
    mockAuth.mockImplementation(mockUnauthenticatedSession());
    const res = await GET(buildGet("/api/vote", { chatId: "chat-1" }));
    expect(res.status).toBe(401);
  });

  it("returns 404 when chat not found", async () => {
    mockGetChatById.mockResolvedValue(null);
    const res = await GET(buildGet("/api/vote", { chatId: "chat-1" }));
    expect(res.status).toBe(404);
  });

  it("returns 403 when chat belongs to another user", async () => {
    mockGetChatById.mockResolvedValue({ userId: "other-user" });
    const res = await GET(buildGet("/api/vote", { chatId: "chat-1" }));
    expect(res.status).toBe(403);
  });

  it("returns 200 with votes array on success", async () => {
    const votes = [{ chatId: "chat-1", messageId: "msg-1", isUpvoted: true }];
    mockGetChatById.mockResolvedValue({ userId: mockSession.user.id });
    mockGetVotesByChatId.mockResolvedValue(votes);

    const res = await GET(buildGet("/api/vote", { chatId: "chat-1" }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual(votes);
  });
});

describe("PATCH /api/vote", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth.mockImplementation(mockAuthenticatedSession());
  });

  it("returns 400 when required fields are missing", async () => {
    const res = await PATCH(
      buildJson("PATCH", "/api/vote", { chatId: "chat-1" })
    );
    expect(res.status).toBe(400);
  });

  it("returns 401 when not authenticated", async () => {
    mockAuth.mockImplementation(mockUnauthenticatedSession());
    const res = await PATCH(
      buildJson("PATCH", "/api/vote", {
        chatId: "chat-1",
        messageId: "msg-1",
        type: "up",
      })
    );
    expect(res.status).toBe(401);
  });

  it("returns 200 and calls voteMessage on success", async () => {
    mockGetChatById.mockResolvedValue({ userId: mockSession.user.id });
    mockVoteMessage.mockResolvedValue(undefined);

    const res = await PATCH(
      buildJson("PATCH", "/api/vote", {
        chatId: "chat-1",
        messageId: "msg-1",
        type: "up",
      })
    );
    expect(res.status).toBe(200);
    expect(mockVoteMessage).toHaveBeenCalledWith({
      chatId: "chat-1",
      messageId: "msg-1",
      type: "up",
    });
  });
});
