import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  mockAuthenticatedSession,
  mockUnauthenticatedSession,
} from "@/__tests__/helpers/auth";

// Mock dependencies
const mockAuth = vi.fn();

vi.mock("@/app/(auth)/auth", () => ({
  auth: (...args: any[]) => mockAuth(...args),
}));

vi.mock("@vercel/blob", () => ({
  put: vi.fn().mockResolvedValue({
    url: "https://blob.vercel-storage.com/test.png",
    pathname: "test.png",
    contentType: "image/png",
    contentDisposition: 'attachment; filename="test.png"',
  }),
}));

const { POST } = await import("../route");

function buildUploadRequest(file?: Blob, filename = "test.png"): Request {
  const formData = new FormData();
  if (file) {
    formData.append("file", file, filename);
  }
  return new Request("http://localhost:3000/api/files/upload", {
    method: "POST",
    body: formData,
  });
}

describe("POST /api/files/upload", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth.mockImplementation(mockAuthenticatedSession());
  });

  it("returns 401 when not authenticated", async () => {
    mockAuth.mockImplementation(mockUnauthenticatedSession());
    const file = new Blob(["data"], { type: "image/png" });
    const res = await POST(buildUploadRequest(file));
    expect(res.status).toBe(401);
  });

  it("returns 400 when no file is provided", async () => {
    const res = await POST(buildUploadRequest());
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("No file");
  });

  it("returns 400 when file type is invalid", async () => {
    const file = new Blob(["data"], { type: "application/pdf" });
    const res = await POST(buildUploadRequest(file, "test.pdf"));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("JPEG or PNG");
  });

  it("returns 200 with blob data on success", async () => {
    const file = new Blob(["data"], { type: "image/png" });
    const res = await POST(buildUploadRequest(file));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.url).toContain("blob.vercel-storage.com");
  });
});
