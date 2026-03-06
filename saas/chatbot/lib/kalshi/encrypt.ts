import "server-only";
import * as crypto from "node:crypto";

/**
 * AES-256-GCM encryption for Kalshi API credentials.
 *
 * Uses KALSHI_ENCRYPTION_KEY env var (32-byte hex string).
 * Generate with: openssl rand -hex 32
 *
 * Encrypted format: base64(iv:authTag:ciphertext) — all hex-encoded fields
 * joined by ":" then base64'd as a single string for safe DB storage.
 */

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16; // bytes
const AUTH_TAG_LENGTH = 16; // bytes

function getEncryptionKey(): Buffer {
  const hex = process.env.KALSHI_ENCRYPTION_KEY;
  if (!hex) {
    throw new Error(
      "KALSHI_ENCRYPTION_KEY env var is required. Generate with: openssl rand -hex 32"
    );
  }
  const key = Buffer.from(hex, "hex");
  if (key.length !== 32) {
    throw new Error(
      `KALSHI_ENCRYPTION_KEY must be a 32-byte hex string (64 hex chars). Got ${key.length} bytes.`
    );
  }
  return key;
}

/**
 * Encrypt a plaintext string.
 * Returns a base64-encoded string: iv:authTag:ciphertext (all hex).
 */
export function encrypt(plaintext: string): string {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  // Store as hex fields joined by colon, then base64 the whole thing
  const payload = `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted.toString("hex")}`;
  return Buffer.from(payload).toString("base64");
}

/**
 * Decrypt a ciphertext string produced by `encrypt`.
 */
export function decrypt(ciphertext: string): string {
  const key = getEncryptionKey();
  const payload = Buffer.from(ciphertext, "base64").toString("utf8");
  const [ivHex, authTagHex, encryptedHex] = payload.split(":");

  if (!ivHex || !authTagHex || !encryptedHex) {
    throw new Error("Invalid encrypted credential format");
  }

  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");
  const encryptedData = Buffer.from(encryptedHex, "hex");

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  return Buffer.concat([
    decipher.update(encryptedData),
    decipher.final(),
  ]).toString("utf8");
}
