import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  mockAuthenticatedSession,
  mockSession,
  mockUnauthenticatedSession,
} from "@/__tests__/helpers/auth";
import { buildGet } from "@/__tests__/helpers/request";

// Mock dependencies
const mockAuth = vi.fn();
const mockGetSuggestionsByDocumentId = vi.fn();

vi.mock("@/app/(auth)/auth", () => ({
  auth: (...args: any[]) => mockAuth(...args),
}));

vi.mock("@/lib/db/queries", () => ({
  getSuggestionsByDocumentId: (...args: any[]) =>
    mockGetSuggestionsByDocumentId(...args),
}));

const { GET } = await import("../route");

describe("GET /api/suggestions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth.mockImplementation(mockAuthenticatedSession());
  });

  it("returns 400 when documentId is missing", async () => {
    const res = await GET(buildGet("/api/suggestions"));
    expect(res.status).toBe(400);
  });

  it("returns 401 when not authenticated", async () => {
    mockAuth.mockImplementation(mockUnauthenticatedSession());
    const res = await GET(
      buildGet("/api/suggestions", { documentId: "doc-1" })
    );
    expect(res.status).toBe(401);
  });

  it("returns empty array when no suggestions exist", async () => {
    mockGetSuggestionsByDocumentId.mockResolvedValue([]);
    const res = await GET(
      buildGet("/api/suggestions", { documentId: "doc-1" })
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual([]);
  });

  it("returns 403 when suggestion belongs to another user", async () => {
    mockGetSuggestionsByDocumentId.mockResolvedValue([
      { userId: "other-user", id: "sug-1" },
    ]);
    const res = await GET(
      buildGet("/api/suggestions", { documentId: "doc-1" })
    );
    expect(res.status).toBe(403);
  });

  it("returns suggestions array on success", async () => {
    const suggestions = [
      {
        id: "sug-1",
        userId: mockSession.user.id,
        originalText: "foo",
        suggestedText: "bar",
      },
    ];
    mockGetSuggestionsByDocumentId.mockResolvedValue(suggestions);
    const res = await GET(
      buildGet("/api/suggestions", { documentId: "doc-1" })
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual(suggestions);
  });
});
