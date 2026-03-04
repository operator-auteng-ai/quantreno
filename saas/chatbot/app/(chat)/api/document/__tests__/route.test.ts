import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  mockAuthenticatedSession,
  mockSession,
  mockUnauthenticatedSession,
} from "@/__tests__/helpers/auth";
import { buildDelete, buildGet, buildJson } from "@/__tests__/helpers/request";

// Mock dependencies
const mockAuth = vi.fn();
const mockGetDocumentsById = vi.fn();
const mockSaveDocument = vi.fn();
const mockDeleteDocumentsByIdAfterTimestamp = vi.fn();

vi.mock("@/app/(auth)/auth", () => ({
  auth: (...args: any[]) => mockAuth(...args),
}));

vi.mock("@/lib/db/queries", () => ({
  getDocumentsById: (...args: any[]) => mockGetDocumentsById(...args),
  saveDocument: (...args: any[]) => mockSaveDocument(...args),
  deleteDocumentsByIdAfterTimestamp: (...args: any[]) =>
    mockDeleteDocumentsByIdAfterTimestamp(...args),
}));

const { GET, POST, DELETE } = await import("../route");

describe("GET /api/document", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth.mockImplementation(mockAuthenticatedSession());
  });

  it("returns 400 when id is missing", async () => {
    const res = await GET(buildGet("/api/document"));
    expect(res.status).toBe(400);
  });

  it("returns 401 when not authenticated", async () => {
    mockAuth.mockImplementation(mockUnauthenticatedSession());
    const res = await GET(buildGet("/api/document", { id: "doc-1" }));
    expect(res.status).toBe(401);
  });

  it("returns 404 when document not found", async () => {
    mockGetDocumentsById.mockResolvedValue([]);
    const res = await GET(buildGet("/api/document", { id: "doc-1" }));
    expect(res.status).toBe(404);
  });

  it("returns 403 when document belongs to another user", async () => {
    mockGetDocumentsById.mockResolvedValue([{ userId: "other-user" }]);
    const res = await GET(buildGet("/api/document", { id: "doc-1" }));
    expect(res.status).toBe(403);
  });

  it("returns 200 with documents on success", async () => {
    const docs = [{ id: "doc-1", userId: mockSession.user.id, title: "Test" }];
    mockGetDocumentsById.mockResolvedValue(docs);

    const res = await GET(buildGet("/api/document", { id: "doc-1" }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual(docs);
  });
});

describe("POST /api/document", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth.mockImplementation(mockAuthenticatedSession());
  });

  it("returns 400 when id param is missing", async () => {
    const res = await POST(
      buildJson("POST", "/api/document", {
        content: "test",
        title: "Test",
        kind: "text",
      })
    );
    expect(res.status).toBe(400);
  });

  it("returns 200 and saves new document on success", async () => {
    const saved = { id: "doc-1", title: "Test", content: "test" };
    mockGetDocumentsById.mockResolvedValue([]);
    mockSaveDocument.mockResolvedValue(saved);

    const res = await POST(
      buildJson(
        "POST",
        "/api/document",
        { content: "test", title: "Test", kind: "text" },
        { id: "doc-1" }
      )
    );
    expect(res.status).toBe(200);
    expect(mockSaveDocument).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "doc-1",
        userId: mockSession.user.id,
      })
    );
  });

  it("returns 403 when updating another user's document", async () => {
    mockGetDocumentsById.mockResolvedValue([{ userId: "other-user" }]);

    const res = await POST(
      buildJson(
        "POST",
        "/api/document",
        { content: "test", title: "Test", kind: "text" },
        { id: "doc-1" }
      )
    );
    expect(res.status).toBe(403);
  });
});

describe("DELETE /api/document", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth.mockImplementation(mockAuthenticatedSession());
  });

  it("returns 400 when id is missing", async () => {
    const res = await DELETE(buildDelete("/api/document"));
    expect(res.status).toBe(400);
  });

  it("returns 400 when timestamp is missing", async () => {
    const res = await DELETE(buildDelete("/api/document", { id: "doc-1" }));
    expect(res.status).toBe(400);
  });

  it("returns 200 on success", async () => {
    mockGetDocumentsById.mockResolvedValue([{ userId: mockSession.user.id }]);
    mockDeleteDocumentsByIdAfterTimestamp.mockResolvedValue({ count: 1 });

    const res = await DELETE(
      buildDelete("/api/document", {
        id: "doc-1",
        timestamp: "2026-01-01T00:00:00Z",
      })
    );
    expect(res.status).toBe(200);
  });
});
