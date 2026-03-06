import { vi } from "vitest";

export const mockSession = {
  user: {
    id: "user-001",
    email: "test@example.com",
    type: "regular" as const,
  },
  expires: new Date(Date.now() + 86_400_000).toISOString(),
};

/**
 * Mock `auth()` to return an authenticated session.
 * Must be called at module scope (inside vi.mock or beforeEach).
 */
export function mockAuthenticatedSession(session = mockSession) {
  return vi.fn().mockResolvedValue(session);
}

/**
 * Mock `auth()` to return null (unauthenticated).
 */
export function mockUnauthenticatedSession() {
  return vi.fn().mockResolvedValue(null);
}
