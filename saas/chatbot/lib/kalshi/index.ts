import "server-only";
import {
  getKalshiCredentialByUserId,
  touchKalshiCredential,
} from "@/lib/db/queries";
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

  console.log("[kalshi] getKalshiClientForUser lookup", {
    userId,
    found: !!row,
  });

  if (!row) {
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
    console.error(
      "[kalshi] Failed to decrypt credentials for user",
      userId,
      err
    );
    throw new Error(
      "Failed to decrypt Kalshi credentials. Please re-enter them in Settings."
    );
  }

  // Fire-and-forget usage timestamp (non-blocking)
  touchKalshiCredential({ userId }).catch(() => {});

  return createKalshiClient({ apiKey, privateKeyPem });
}
