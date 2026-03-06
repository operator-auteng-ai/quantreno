import "server-only";

import {
  and,
  asc,
  count,
  desc,
  eq,
  gt,
  gte,
  inArray,
  lt,
  type SQL,
} from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import type { ArtifactKind } from "@/components/artifact";
import type { VisibilityType } from "@/components/visibility-selector";
import { ChatbotError } from "../errors";
import { log } from "../logger";
import { generateUUID } from "../utils";
import {
  type Chat,
  chat,
  type DBMessage,
  document,
  kalshiCredential,
  type KalshiCredential,
  message,
  strategy,
  type Strategy,
  type Suggestion,
  stream,
  suggestion,
  toolCall,
  trade,
  type Trade,
  type User,
  user,
  vote,
  aiCall,
} from "./schema";
import { generateHashedPassword } from "./utils";

// Optionally, if not using email/pass login, you can
// use the Drizzle adapter for Auth.js / NextAuth
// https://authjs.dev/reference/adapter/drizzle

// biome-ignore lint: Forbidden non-null assertion.
const client = postgres(process.env.POSTGRES_URL!);
const db = drizzle(client);

export async function getUser(email: string): Promise<User[]> {
  try {
    return await db.select().from(user).where(eq(user.email, email));
  } catch (_error) {
    throw new ChatbotError(
      "bad_request:database",
      "Failed to get user by email"
    );
  }
}

export async function createUser(email: string, password: string) {
  const hashedPassword = generateHashedPassword(password);

  try {
    return await db.insert(user).values({ email, password: hashedPassword });
  } catch (_error) {
    throw new ChatbotError("bad_request:database", "Failed to create user");
  }
}

/**
 * Look up a user by email; create them with no password if they don't exist.
 * Used for OAuth sign-ins (Google etc.) where we manage sessions ourselves.
 */
export async function getOrCreateOAuthUser(
  email: string
): Promise<{ id: string; email: string }> {
  const existing = await getUser(email);
  if (existing.length > 0) {
    return { id: existing[0].id, email: existing[0].email };
  }

  try {
    const [created] = await db
      .insert(user)
      .values({ email, password: null })
      .returning({ id: user.id, email: user.email });
    return created;
  } catch (_error) {
    throw new ChatbotError("bad_request:database", "Failed to create OAuth user");
  }
}

export async function createGuestUser() {
  const email = `guest-${Date.now()}`;
  const password = generateHashedPassword(generateUUID());

  try {
    return await db.insert(user).values({ email, password }).returning({
      id: user.id,
      email: user.email,
    });
  } catch (_error) {
    throw new ChatbotError(
      "bad_request:database",
      "Failed to create guest user"
    );
  }
}

export async function saveChat({
  id,
  userId,
  title,
  visibility,
}: {
  id: string;
  userId: string;
  title: string;
  visibility: VisibilityType;
}) {
  try {
    return await db.insert(chat).values({
      id,
      createdAt: new Date(),
      userId,
      title,
      visibility,
    });
  } catch (_error) {
    throw new ChatbotError("bad_request:database", "Failed to save chat");
  }
}

export async function deleteChatById({ id }: { id: string }) {
  try {
    await db.delete(vote).where(eq(vote.chatId, id));
    await db.delete(message).where(eq(message.chatId, id));
    await db.delete(stream).where(eq(stream.chatId, id));

    const [chatsDeleted] = await db
      .delete(chat)
      .where(eq(chat.id, id))
      .returning();
    return chatsDeleted;
  } catch (_error) {
    throw new ChatbotError(
      "bad_request:database",
      "Failed to delete chat by id"
    );
  }
}

export async function deleteAllChatsByUserId({ userId }: { userId: string }) {
  try {
    const userChats = await db
      .select({ id: chat.id })
      .from(chat)
      .where(eq(chat.userId, userId));

    if (userChats.length === 0) {
      return { deletedCount: 0 };
    }

    const chatIds = userChats.map((c) => c.id);

    await db.delete(vote).where(inArray(vote.chatId, chatIds));
    await db.delete(message).where(inArray(message.chatId, chatIds));
    await db.delete(stream).where(inArray(stream.chatId, chatIds));

    const deletedChats = await db
      .delete(chat)
      .where(eq(chat.userId, userId))
      .returning();

    return { deletedCount: deletedChats.length };
  } catch (_error) {
    throw new ChatbotError(
      "bad_request:database",
      "Failed to delete all chats by user id"
    );
  }
}

export async function getChatsByUserId({
  id,
  limit,
  startingAfter,
  endingBefore,
}: {
  id: string;
  limit: number;
  startingAfter: string | null;
  endingBefore: string | null;
}) {
  try {
    const extendedLimit = limit + 1;

    const query = (whereCondition?: SQL<any>) =>
      db
        .select()
        .from(chat)
        .where(
          whereCondition
            ? and(whereCondition, eq(chat.userId, id))
            : eq(chat.userId, id)
        )
        .orderBy(desc(chat.createdAt))
        .limit(extendedLimit);

    let filteredChats: Chat[] = [];

    if (startingAfter) {
      const [selectedChat] = await db
        .select()
        .from(chat)
        .where(eq(chat.id, startingAfter))
        .limit(1);

      if (!selectedChat) {
        throw new ChatbotError(
          "not_found:database",
          `Chat with id ${startingAfter} not found`
        );
      }

      filteredChats = await query(gt(chat.createdAt, selectedChat.createdAt));
    } else if (endingBefore) {
      const [selectedChat] = await db
        .select()
        .from(chat)
        .where(eq(chat.id, endingBefore))
        .limit(1);

      if (!selectedChat) {
        throw new ChatbotError(
          "not_found:database",
          `Chat with id ${endingBefore} not found`
        );
      }

      filteredChats = await query(lt(chat.createdAt, selectedChat.createdAt));
    } else {
      filteredChats = await query();
    }

    const hasMore = filteredChats.length > limit;

    return {
      chats: hasMore ? filteredChats.slice(0, limit) : filteredChats,
      hasMore,
    };
  } catch (_error) {
    throw new ChatbotError(
      "bad_request:database",
      "Failed to get chats by user id"
    );
  }
}

export async function getChatById({ id }: { id: string }) {
  try {
    const [selectedChat] = await db.select().from(chat).where(eq(chat.id, id));
    if (!selectedChat) {
      return null;
    }

    return selectedChat;
  } catch (_error) {
    throw new ChatbotError("bad_request:database", "Failed to get chat by id");
  }
}

export async function saveMessages({ messages }: { messages: DBMessage[] }) {
  try {
    return await db.insert(message).values(messages);
  } catch (_error) {
    throw new ChatbotError("bad_request:database", "Failed to save messages");
  }
}

export async function updateMessage({
  id,
  parts,
}: {
  id: string;
  parts: DBMessage["parts"];
}) {
  try {
    return await db.update(message).set({ parts }).where(eq(message.id, id));
  } catch (_error) {
    throw new ChatbotError("bad_request:database", "Failed to update message");
  }
}

export async function getMessagesByChatId({ id }: { id: string }) {
  try {
    return await db
      .select()
      .from(message)
      .where(eq(message.chatId, id))
      .orderBy(asc(message.createdAt));
  } catch (_error) {
    throw new ChatbotError(
      "bad_request:database",
      "Failed to get messages by chat id"
    );
  }
}

export async function voteMessage({
  chatId,
  messageId,
  type,
}: {
  chatId: string;
  messageId: string;
  type: "up" | "down";
}) {
  try {
    const [existingVote] = await db
      .select()
      .from(vote)
      .where(and(eq(vote.messageId, messageId)));

    if (existingVote) {
      return await db
        .update(vote)
        .set({ isUpvoted: type === "up" })
        .where(and(eq(vote.messageId, messageId), eq(vote.chatId, chatId)));
    }
    return await db.insert(vote).values({
      chatId,
      messageId,
      isUpvoted: type === "up",
    });
  } catch (_error) {
    throw new ChatbotError("bad_request:database", "Failed to vote message");
  }
}

export async function getVotesByChatId({ id }: { id: string }) {
  try {
    return await db.select().from(vote).where(eq(vote.chatId, id));
  } catch (_error) {
    throw new ChatbotError(
      "bad_request:database",
      "Failed to get votes by chat id"
    );
  }
}

export async function saveDocument({
  id,
  title,
  kind,
  content,
  userId,
}: {
  id: string;
  title: string;
  kind: ArtifactKind;
  content: string;
  userId: string;
}) {
  try {
    return await db
      .insert(document)
      .values({
        id,
        title,
        kind,
        content,
        userId,
        createdAt: new Date(),
      })
      .returning();
  } catch (_error) {
    throw new ChatbotError("bad_request:database", "Failed to save document");
  }
}

export async function getDocumentsById({ id }: { id: string }) {
  try {
    const documents = await db
      .select()
      .from(document)
      .where(eq(document.id, id))
      .orderBy(asc(document.createdAt));

    return documents;
  } catch (_error) {
    throw new ChatbotError(
      "bad_request:database",
      "Failed to get documents by id"
    );
  }
}

export async function getDocumentById({ id }: { id: string }) {
  try {
    const [selectedDocument] = await db
      .select()
      .from(document)
      .where(eq(document.id, id))
      .orderBy(desc(document.createdAt));

    return selectedDocument;
  } catch (_error) {
    throw new ChatbotError(
      "bad_request:database",
      "Failed to get document by id"
    );
  }
}

export async function deleteDocumentsByIdAfterTimestamp({
  id,
  timestamp,
}: {
  id: string;
  timestamp: Date;
}) {
  try {
    await db
      .delete(suggestion)
      .where(
        and(
          eq(suggestion.documentId, id),
          gt(suggestion.documentCreatedAt, timestamp)
        )
      );

    return await db
      .delete(document)
      .where(and(eq(document.id, id), gt(document.createdAt, timestamp)))
      .returning();
  } catch (_error) {
    throw new ChatbotError(
      "bad_request:database",
      "Failed to delete documents by id after timestamp"
    );
  }
}

export async function saveSuggestions({
  suggestions,
}: {
  suggestions: Suggestion[];
}) {
  try {
    return await db.insert(suggestion).values(suggestions);
  } catch (_error) {
    throw new ChatbotError(
      "bad_request:database",
      "Failed to save suggestions"
    );
  }
}

export async function getSuggestionsByDocumentId({
  documentId,
}: {
  documentId: string;
}) {
  try {
    return await db
      .select()
      .from(suggestion)
      .where(eq(suggestion.documentId, documentId));
  } catch (_error) {
    throw new ChatbotError(
      "bad_request:database",
      "Failed to get suggestions by document id"
    );
  }
}

export async function getMessageById({ id }: { id: string }) {
  try {
    return await db.select().from(message).where(eq(message.id, id));
  } catch (_error) {
    throw new ChatbotError(
      "bad_request:database",
      "Failed to get message by id"
    );
  }
}

export async function deleteMessagesByChatIdAfterTimestamp({
  chatId,
  timestamp,
}: {
  chatId: string;
  timestamp: Date;
}) {
  try {
    const messagesToDelete = await db
      .select({ id: message.id })
      .from(message)
      .where(
        and(eq(message.chatId, chatId), gte(message.createdAt, timestamp))
      );

    const messageIds = messagesToDelete.map(
      (currentMessage) => currentMessage.id
    );

    if (messageIds.length > 0) {
      await db
        .delete(vote)
        .where(
          and(eq(vote.chatId, chatId), inArray(vote.messageId, messageIds))
        );

      return await db
        .delete(message)
        .where(
          and(eq(message.chatId, chatId), inArray(message.id, messageIds))
        );
    }
  } catch (_error) {
    throw new ChatbotError(
      "bad_request:database",
      "Failed to delete messages by chat id after timestamp"
    );
  }
}

export async function updateChatVisibilityById({
  chatId,
  visibility,
}: {
  chatId: string;
  visibility: "private" | "public";
}) {
  try {
    return await db.update(chat).set({ visibility }).where(eq(chat.id, chatId));
  } catch (_error) {
    throw new ChatbotError(
      "bad_request:database",
      "Failed to update chat visibility by id"
    );
  }
}

export async function updateChatTitleById({
  chatId,
  title,
}: {
  chatId: string;
  title: string;
}) {
  try {
    return await db.update(chat).set({ title }).where(eq(chat.id, chatId));
  } catch (error) {
    log.warn("db", "failed to update chat title", { chatId, error: error instanceof Error ? error.message : String(error) });
    return;
  }
}

export async function getMessageCountByUserId({
  id,
  differenceInHours,
}: {
  id: string;
  differenceInHours: number;
}) {
  try {
    const twentyFourHoursAgo = new Date(
      Date.now() - differenceInHours * 60 * 60 * 1000
    );

    const [stats] = await db
      .select({ count: count(message.id) })
      .from(message)
      .innerJoin(chat, eq(message.chatId, chat.id))
      .where(
        and(
          eq(chat.userId, id),
          gte(message.createdAt, twentyFourHoursAgo),
          eq(message.role, "user")
        )
      )
      .execute();

    return stats?.count ?? 0;
  } catch (_error) {
    throw new ChatbotError(
      "bad_request:database",
      "Failed to get message count by user id"
    );
  }
}

export async function createStreamId({
  streamId,
  chatId,
}: {
  streamId: string;
  chatId: string;
}) {
  try {
    await db
      .insert(stream)
      .values({ id: streamId, chatId, createdAt: new Date() });
  } catch (_error) {
    throw new ChatbotError(
      "bad_request:database",
      "Failed to create stream id"
    );
  }
}

export async function getStreamIdsByChatId({ chatId }: { chatId: string }) {
  try {
    const streamIds = await db
      .select({ id: stream.id })
      .from(stream)
      .where(eq(stream.chatId, chatId))
      .orderBy(asc(stream.createdAt))
      .execute();

    return streamIds.map(({ id }) => id);
  } catch (_error) {
    throw new ChatbotError(
      "bad_request:database",
      "Failed to get stream ids by chat id"
    );
  }
}

// ─── KalshiCredential queries ─────────────────────────────────────────────────

export async function getKalshiCredentialByUserId({
  userId,
}: { userId: string }): Promise<KalshiCredential | null> {
  try {
    const [row] = await db
      .select()
      .from(kalshiCredential)
      .where(eq(kalshiCredential.userId, userId))
      .limit(1);
    return row ?? null;
  } catch (_error) {
    throw new ChatbotError(
      "bad_request:database",
      "Failed to get Kalshi credential"
    );
  }
}

export async function upsertKalshiCredential({
  userId,
  apiKeyEncrypted,
  privateKeyEncrypted,
}: {
  userId: string;
  apiKeyEncrypted: string;
  privateKeyEncrypted: string;
}): Promise<KalshiCredential> {
  try {
    const [row] = await db
      .insert(kalshiCredential)
      .values({ userId, apiKeyEncrypted, privateKeyEncrypted })
      .onConflictDoUpdate({
        target: kalshiCredential.userId,
        set: {
          apiKeyEncrypted,
          privateKeyEncrypted,
          lastUsedAt: new Date(),
        },
      })
      .returning();
    return row;
  } catch (_error) {
    throw new ChatbotError(
      "bad_request:database",
      "Failed to save Kalshi credential"
    );
  }
}

export async function deleteKalshiCredential({
  userId,
}: { userId: string }): Promise<void> {
  try {
    await db
      .delete(kalshiCredential)
      .where(eq(kalshiCredential.userId, userId));
  } catch (_error) {
    throw new ChatbotError(
      "bad_request:database",
      "Failed to delete Kalshi credential"
    );
  }
}

export async function touchKalshiCredential({
  userId,
}: { userId: string }): Promise<void> {
  try {
    await db
      .update(kalshiCredential)
      .set({ lastUsedAt: new Date() })
      .where(eq(kalshiCredential.userId, userId));
  } catch (_error) {
    // Non-fatal — just a usage timestamp
  }
}

// ─── Trade queries ────────────────────────────────────────────────────────────

export async function logTrade({
  userId,
  orderId,
  ticker,
  side,
  action,
  count,
  priceCents,
  totalCostCents,
  strategy,
  notes,
}: {
  userId: string;
  orderId: string;
  ticker: string;
  side: "yes" | "no";
  action: "buy" | "sell";
  count: number;
  priceCents: number;
  totalCostCents: number;
  strategy?: string;
  notes?: string;
}): Promise<Trade> {
  try {
    const [row] = await db
      .insert(trade)
      .values({
        userId,
        orderId,
        ticker,
        side,
        action,
        count,
        priceCents,
        totalCostCents,
        strategy: strategy ?? null,
        notes: notes ?? null,
        status: "open",
      })
      .returning();
    return row;
  } catch (_error) {
    throw new ChatbotError("bad_request:database", "Failed to log trade");
  }
}

export async function getOpenTradesByUserId({
  userId,
}: { userId: string }): Promise<Trade[]> {
  try {
    return await db
      .select()
      .from(trade)
      .where(and(eq(trade.userId, userId), eq(trade.status, "open")))
      .orderBy(desc(trade.createdAt));
  } catch (_error) {
    throw new ChatbotError(
      "bad_request:database",
      "Failed to retrieve open trades"
    );
  }
}

export async function getRecentTradesByUserId({
  userId,
  limit: limitArg = 20,
}: {
  userId: string;
  limit?: number;
}): Promise<Trade[]> {
  try {
    return await db
      .select()
      .from(trade)
      .where(eq(trade.userId, userId))
      .orderBy(desc(trade.createdAt))
      .limit(limitArg);
  } catch (_error) {
    throw new ChatbotError(
      "bad_request:database",
      "Failed to retrieve trades"
    );
  }
}

export async function closeTradeByOrderId({
  userId,
  orderId,
  exitPriceCents,
  pnlCents,
}: {
  userId: string;
  orderId: string;
  exitPriceCents: number;
  pnlCents: number;
}): Promise<void> {
  try {
    await db
      .update(trade)
      .set({
        status: "closed",
        closedAt: new Date(),
        exitPriceCents,
        pnlCents,
      })
      .where(and(eq(trade.userId, userId), eq(trade.orderId, orderId)));
  } catch (_error) {
    throw new ChatbotError(
      "bad_request:database",
      "Failed to close trade"
    );
  }
}

export async function cancelTradeByOrderId({
  userId,
  orderId,
}: {
  userId: string;
  orderId: string;
}): Promise<void> {
  try {
    await db
      .update(trade)
      .set({ status: "cancelled" })
      .where(and(eq(trade.userId, userId), eq(trade.orderId, orderId)));
  } catch (_error) {
    // Non-fatal — the order may not have been logged if approval was pending
  }
}

// ─── Strategy queries ────────────────────────────────────────────────────────

export async function getStrategiesByUserId({
  userId,
  status,
}: {
  userId: string;
  status?: "active" | "paused" | "archived";
}): Promise<Strategy[]> {
  try {
    const conditions = [eq(strategy.userId, userId)];
    if (status) {
      conditions.push(eq(strategy.status, status));
    }
    return await db
      .select()
      .from(strategy)
      .where(and(...conditions))
      .orderBy(desc(strategy.createdAt));
  } catch (_error) {
    throw new ChatbotError(
      "bad_request:database",
      "Failed to get strategies"
    );
  }
}

export async function getStrategyById({
  id,
  userId,
}: {
  id: string;
  userId: string;
}): Promise<Strategy | null> {
  try {
    const [row] = await db
      .select()
      .from(strategy)
      .where(and(eq(strategy.id, id), eq(strategy.userId, userId)))
      .limit(1);
    return row ?? null;
  } catch (_error) {
    throw new ChatbotError(
      "bad_request:database",
      "Failed to get strategy"
    );
  }
}

export async function createStrategy({
  userId,
  name,
  playbook,
  instrumentType,
  budgetCents,
  config,
}: {
  userId: string;
  name: string;
  playbook: string;
  instrumentType: string;
  budgetCents: number;
  config: Record<string, unknown>;
}): Promise<Strategy> {
  try {
    const [row] = await db
      .insert(strategy)
      .values({
        userId,
        name,
        playbook: playbook as Strategy["playbook"],
        instrumentType: instrumentType as Strategy["instrumentType"],
        budgetCents,
        config,
        status: "active",
      })
      .returning();
    return row;
  } catch (_error) {
    throw new ChatbotError(
      "bad_request:database",
      "Failed to create strategy"
    );
  }
}

export async function updateStrategy({
  id,
  userId,
  updates,
}: {
  id: string;
  userId: string;
  updates: Partial<{
    name: string;
    budgetCents: number;
    config: Record<string, unknown>;
    status: string;
  }>;
}): Promise<Strategy | null> {
  try {
    const setValues: Record<string, unknown> = {
      ...updates,
      updatedAt: new Date(),
    };
    const [row] = await db
      .update(strategy)
      .set(setValues)
      .where(and(eq(strategy.id, id), eq(strategy.userId, userId)))
      .returning();
    return row ?? null;
  } catch (_error) {
    throw new ChatbotError(
      "bad_request:database",
      "Failed to update strategy"
    );
  }
}

export async function getActiveStrategiesByUserId({
  userId,
}: { userId: string }): Promise<Strategy[]> {
  return getStrategiesByUserId({ userId, status: "active" });
}

export async function getStrategyTradeStats({
  userId,
}: { userId: string }): Promise<
  Array<{ strategyId: string | null; openCount: number }>
> {
  try {
    const rows = await db
      .select({
        strategyId: trade.strategyId,
        openCount: count(trade.id),
      })
      .from(trade)
      .where(and(eq(trade.userId, userId), eq(trade.status, "open")))
      .groupBy(trade.strategyId);

    return rows;
  } catch (_error) {
    return [];
  }
}

// ─── Audit queries ───────────────────────────────────────────────────────────

export async function saveToolCall(params: {
  userId: string;
  chatId: string;
  stepIndex: number;
  toolName: string;
  input: unknown;
  result: unknown;
  resultChars: number;
  summarized: boolean;
  summaryChars: number | null;
  durationMs: number;
}): Promise<void> {
  try {
    await db.insert(toolCall).values({
      userId: params.userId,
      chatId: params.chatId,
      stepIndex: params.stepIndex,
      toolName: params.toolName,
      input: params.input as any,
      result: params.result as any,
      resultChars: params.resultChars,
      summarized: params.summarized,
      summaryChars: params.summaryChars,
      durationMs: params.durationMs,
    });
  } catch (_error) {
    log.warn("db", "failed to save tool call audit", {
      toolName: params.toolName,
      chatId: params.chatId,
    });
  }
}

export async function saveAiCall(params: {
  userId: string;
  chatId: string;
  stepIndex: number;
  model: string;
  inputTokens: number | null;
  outputTokens: number | null;
  totalTokens: number | null;
  cacheReadTokens: number | null;
  cacheWriteTokens: number | null;
  reasoningTokens: number | null;
  toolCallCount: number;
  finishReason: string | null;
}): Promise<void> {
  try {
    await db.insert(aiCall).values(params);
  } catch (_error) {
    log.warn("db", "failed to save AI call audit", {
      model: params.model,
      chatId: params.chatId,
    });
  }
}
