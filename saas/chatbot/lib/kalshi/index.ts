import "server-only";
import { decrypt } from "./encrypt";
import { createKalshiClient } from "./client";
import {
  getKalshiCredentialByUserId,
  touchKalshiCredential,
} from "@/lib/db/queries";
import { KalshiError } from "./client";

export { createKalshiClient, KalshiError, KALSHI_BASE_URL } from "./client";
export { encrypt, decrypt } from "./encrypt";
export type { KalshiClient } from "./client";
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
    throw new Error(
      "Kalshi account not connected. Please add your API key in Settings."
    );
  }

  const apiKey = decrypt(row.apiKeyEncrypted);
  const privateKeyPem = decrypt(row.privateKeyEncrypted);

  // Fire-and-forget usage timestamp (non-blocking)
  touchKalshiCredential({ userId }).catch(() => {});

  return createKalshiClient({ apiKey, privateKeyPem });
}
