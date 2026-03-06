import { vi } from "vitest";

// `server-only` throws at import time outside RSC context.
// DB queries and other server modules import it, so we stub it for tests.
vi.mock("server-only", () => ({}));
