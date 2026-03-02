import { auth } from "@/app/(auth)/auth";
import { ChatbotError } from "@/lib/errors";
import {
  deleteKalshiCredential,
  getKalshiCredentialByUserId,
  upsertKalshiCredential,
} from "@/lib/db/queries";
import { encrypt } from "@/lib/kalshi/encrypt";
import { createKalshiClient } from "@/lib/kalshi/client";
import { log } from "@/lib/logger";
import { z } from "zod";

// GET /api/kalshi/credentials — returns connection status + balance if connected
export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return new ChatbotError("unauthorized:chat").toResponse();
  }

  const row = await getKalshiCredentialByUserId({ userId: session.user.id });

  log.info("credentials", "GET", {
    userId: session.user.id,
    found: !!row,
  });

  if (!row) {
    return Response.json({ connected: false });
  }

  // Don't expose credentials — just confirm they exist
  return Response.json({
    connected: true,
    lastUsedAt: row.lastUsedAt,
    createdAt: row.createdAt,
  });
}

const saveSchema = z.object({
  apiKey: z.string().min(1),
  privateKeyPem: z.string().includes("-----BEGIN"),
});

// POST /api/kalshi/credentials — test connection, then encrypt + save
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return new ChatbotError("unauthorized:chat").toResponse();
  }

  let body: { apiKey: string; privateKeyPem: string };
  try {
    const json = await request.json();
    body = saveSchema.parse(json);
  } catch {
    return Response.json(
      { error: "Invalid request. Provide apiKey and privateKeyPem." },
      { status: 400 }
    );
  }

  // Test the credentials against the Kalshi API before saving
  try {
    const client = createKalshiClient({
      apiKey: body.apiKey,
      privateKeyPem: body.privateKeyPem,
    });
    const balance = await client.getBalance();

    // Credentials work — encrypt and persist
    const apiKeyEncrypted = encrypt(body.apiKey);
    const privateKeyEncrypted = encrypt(body.privateKeyPem);

    await upsertKalshiCredential({
      userId: session.user.id,
      apiKeyEncrypted,
      privateKeyEncrypted,
    });

    log.info("credentials", "saved", {
      userId: session.user.id,
      balance: balance.balance,
    });

    return Response.json({
      connected: true,
      balance: balance.balance, // cents — lets UI show "connected ($X.XX balance)"
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Connection failed";
    log.error("credentials", "save failed", {
      userId: session.user.id,
      error: message,
    });
    return Response.json(
      { error: `Kalshi connection failed: ${message}` },
      { status: 422 }
    );
  }
}

// DELETE /api/kalshi/credentials — remove saved credentials
export async function DELETE() {
  const session = await auth();
  if (!session?.user) {
    return new ChatbotError("unauthorized:chat").toResponse();
  }

  await deleteKalshiCredential({ userId: session.user.id });
  log.info("credentials", "deleted", { userId: session.user.id });
  return Response.json({ connected: false });
}
