import "server-only";

import { log } from "@/lib/logger";
import { getKalshiCredentialByUserId } from "@/lib/db/queries";
import { getKalshiClientForUser } from "./index";
import type { KalshiBalance, KalshiPosition } from "./types";

// ── Types ────────────────────────────────────────────────────────────────────────

export type KalshiDashboardData = {
  balance: KalshiBalance | null;
  positions: KalshiPosition[];
  connected: boolean;
  error: string | null;
};

// ── Main entry point ─────────────────────────────────────────────────────────────

/**
 * Fetches Kalshi account data for the dashboard.
 * Never throws — returns partial data on failure with an error message.
 */
export async function getKalshiDashboardData(
  userId: string
): Promise<KalshiDashboardData> {
  // Check if user has credentials first (fast DB check, no API call)
  const credential = await getKalshiCredentialByUserId({ userId });

  if (!credential) {
    return {
      balance: null,
      positions: [],
      connected: false,
      error: null,
    };
  }

  // User has credentials — try to fetch live data
  try {
    const client = await getKalshiClientForUser(userId);

    const [balanceResult, positionsResult] = await Promise.allSettled([
      client.getBalance(),
      client.getPositions({ count_filter: "position" }),
    ]);

    const balance =
      balanceResult.status === "fulfilled" ? balanceResult.value : null;

    const positions =
      positionsResult.status === "fulfilled"
        ? positionsResult.value.positions
        : [];

    // Check if any call failed
    const errors: string[] = [];
    if (balanceResult.status === "rejected") {
      errors.push(`Balance: ${balanceResult.reason}`);
    }
    if (positionsResult.status === "rejected") {
      errors.push(`Positions: ${positionsResult.reason}`);
    }

    if (errors.length > 0) {
      log.warn("kalshi", "partial dashboard data failure", {
        userId,
        errors,
      });
    }

    return {
      balance,
      positions,
      connected: true,
      error: errors.length > 0 ? errors.join("; ") : null,
    };
  } catch (err) {
    log.error("kalshi", "dashboard data fetch failed", {
      userId,
      error: err instanceof Error ? err.message : String(err),
    });

    return {
      balance: null,
      positions: [],
      connected: true, // they have credentials, just API is failing
      error: err instanceof Error ? err.message : "Failed to fetch Kalshi data",
    };
  }
}
