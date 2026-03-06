/**
 * Helpers for constructing Request objects to test API route handlers.
 */

const BASE_URL = "http://localhost:3000";

/** Build a GET Request with optional query params. */
export function buildGet(
  path: string,
  params?: Record<string, string>
): Request {
  const url = new URL(path, BASE_URL);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value);
    }
  }
  return new Request(url.toString(), { method: "GET" });
}

/** Build a PATCH/POST/DELETE Request with a JSON body. */
export function buildJson(
  method: "POST" | "PATCH" | "DELETE",
  path: string,
  body?: unknown,
  params?: Record<string, string>
): Request {
  const url = new URL(path, BASE_URL);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value);
    }
  }
  return new Request(url.toString(), {
    method,
    headers: { "Content-Type": "application/json" },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

/** Build a DELETE Request with optional query params (no body). */
export function buildDelete(
  path: string,
  params?: Record<string, string>
): Request {
  const url = new URL(path, BASE_URL);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value);
    }
  }
  return new Request(url.toString(), { method: "DELETE" });
}
