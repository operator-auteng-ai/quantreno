/**
 * Lightweight structured logger for server-side code.
 *
 * Vercel runtime logs map console methods to log levels:
 *   console.log   → info
 *   console.warn  → warning
 *   console.error → error
 *
 * Filter in Vercel dashboard: level:error, level:warning, etc.
 * Filter via CLI: vercel logs <url> --output json | jq 'select(.level == "error")'
 *
 * Usage:
 *   import { log } from "@/lib/logger";
 *   log.info("kalshi", "fetched positions", { count: 4 });
 *   log.warn("kalshi", "slow response", { latencyMs: 2300 });
 *   log.error("kalshi", "API call failed", { status: 401, path: "/portfolio/positions" });
 */

type LogData = Record<string, unknown>;

function fmt(scope: string, message: string, data?: LogData): string {
  const base = `[${scope}] ${message}`;
  if (!data || Object.keys(data).length === 0) return base;
  return `${base} ${JSON.stringify(data)}`;
}

export const log = {
  /** Info-level — routine operations, request flow, state transitions */
  info(scope: string, message: string, data?: LogData) {
    console.log(fmt(scope, message, data));
  },

  /** Warning-level — degraded but non-fatal: slow responses, fallbacks, retries */
  warn(scope: string, message: string, data?: LogData) {
    console.warn(fmt(scope, message, data));
  },

  /** Error-level — failures: API errors, decrypt failures, unexpected states */
  error(scope: string, message: string, data?: LogData) {
    console.error(fmt(scope, message, data));
  },
};
