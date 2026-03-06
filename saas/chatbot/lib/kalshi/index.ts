import "server-only";
import {
  getKalshiCredentialByUserId,
  touchKalshiCredential,
} from "@/lib/db/queries";
import { log } from "@/lib/logger";
import { createKalshiClient } from "./client";
import { decrypt } from "./encrypt";

export type { KalshiClient } from "./client";
export { createKalshiClient, KALSHI_BASE_URL, KalshiError } from "./client";
export { decrypt, encrypt } from "./encrypt";
export * from "./types";

/**
 * Loads a user's encrypted Kalshi credentials from the DB, decrypts them,
 * and returns a ready-to-use Kalshi API client.
 *
 * Throws if the user has no credentials saved.
 */
export async function getKalshiClientForUser(
  userId: string
): Promise<ReturnType<typeof createKalshiClient>> {
  const row = await getKalshiCredentialByUserId({ userId });

  if (!row) {
    log.warn("kalshi", "no credentials found", { userId });
    throw new Error(
      "Kalshi account not connected. Please add your API key in Settings."
    );
  }

  let apiKey: string;
  let privateKeyPem: string;
  try {
    apiKey = decrypt(row.apiKeyEncrypted);
    privateKeyPem = decrypt(row.privateKeyEncrypted);
  } catch (err) {
    log.error("kalshi", "credential decrypt failed", {
      userId,
      error: err instanceof Error ? err.message : String(err),
    });
    throw new Error(
      "Failed to decrypt Kalshi credentials. Please re-enter them in Settings."
    );
  }

  // Fire-and-forget usage timestamp (non-blocking)
  touchKalshiCredential({ userId }).catch(() => {});

  return createKalshiClient({ apiKey, privateKeyPem });
}
