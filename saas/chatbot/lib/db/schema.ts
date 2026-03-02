import type { InferSelectModel } from "drizzle-orm";
import {
  boolean,
  foreignKey,
  integer,
  json,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const user = pgTable("User", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  email: varchar("email", { length: 64 }).notNull(),
  password: varchar("password", { length: 64 }),
});

export type User = InferSelectModel<typeof user>;

export const chat = pgTable("Chat", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  createdAt: timestamp("createdAt").notNull(),
  title: text("title").notNull(),
  userId: uuid("userId")
    .notNull()
    .references(() => user.id),
  visibility: varchar("visibility", { enum: ["public", "private"] })
    .notNull()
    .default("private"),
});

export type Chat = InferSelectModel<typeof chat>;

// DEPRECATED: The following schema is deprecated and will be removed in the future.
// Read the migration guide at https://chatbot.dev/docs/migration-guides/message-parts
export const messageDeprecated = pgTable("Message", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  chatId: uuid("chatId")
    .notNull()
    .references(() => chat.id),
  role: varchar("role").notNull(),
  content: json("content").notNull(),
  createdAt: timestamp("createdAt").notNull(),
});

export type MessageDeprecated = InferSelectModel<typeof messageDeprecated>;

export const message = pgTable("Message_v2", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  chatId: uuid("chatId")
    .notNull()
    .references(() => chat.id),
  role: varchar("role").notNull(),
  parts: json("parts").notNull(),
  attachments: json("attachments").notNull(),
  createdAt: timestamp("createdAt").notNull(),
});

export type DBMessage = InferSelectModel<typeof message>;

// DEPRECATED: The following schema is deprecated and will be removed in the future.
// Read the migration guide at https://chatbot.dev/docs/migration-guides/message-parts
export const voteDeprecated = pgTable(
  "Vote",
  {
    chatId: uuid("chatId")
      .notNull()
      .references(() => chat.id),
    messageId: uuid("messageId")
      .notNull()
      .references(() => messageDeprecated.id),
    isUpvoted: boolean("isUpvoted").notNull(),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.chatId, table.messageId] }),
    };
  }
);

export type VoteDeprecated = InferSelectModel<typeof voteDeprecated>;

export const vote = pgTable(
  "Vote_v2",
  {
    chatId: uuid("chatId")
      .notNull()
      .references(() => chat.id),
    messageId: uuid("messageId")
      .notNull()
      .references(() => message.id),
    isUpvoted: boolean("isUpvoted").notNull(),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.chatId, table.messageId] }),
    };
  }
);

export type Vote = InferSelectModel<typeof vote>;

export const document = pgTable(
  "Document",
  {
    id: uuid("id").notNull().defaultRandom(),
    createdAt: timestamp("createdAt").notNull(),
    title: text("title").notNull(),
    content: text("content"),
    kind: varchar("text", { enum: ["text", "code", "image", "sheet"] })
      .notNull()
      .default("text"),
    userId: uuid("userId")
      .notNull()
      .references(() => user.id),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.id, table.createdAt] }),
    };
  }
);

export type Document = InferSelectModel<typeof document>;

export const suggestion = pgTable(
  "Suggestion",
  {
    id: uuid("id").notNull().defaultRandom(),
    documentId: uuid("documentId").notNull(),
    documentCreatedAt: timestamp("documentCreatedAt").notNull(),
    originalText: text("originalText").notNull(),
    suggestedText: text("suggestedText").notNull(),
    description: text("description"),
    isResolved: boolean("isResolved").notNull().default(false),
    userId: uuid("userId")
      .notNull()
      .references(() => user.id),
    createdAt: timestamp("createdAt").notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.id] }),
    documentRef: foreignKey({
      columns: [table.documentId, table.documentCreatedAt],
      foreignColumns: [document.id, document.createdAt],
    }),
  })
);

export type Suggestion = InferSelectModel<typeof suggestion>;

export const stream = pgTable(
  "Stream",
  {
    id: uuid("id").notNull().defaultRandom(),
    chatId: uuid("chatId").notNull(),
    createdAt: timestamp("createdAt").notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.id] }),
    chatRef: foreignKey({
      columns: [table.chatId],
      foreignColumns: [chat.id],
    }),
  })
);

export type Stream = InferSelectModel<typeof stream>;

// ─── Trading tables ───────────────────────────────────────────────────────────

export const kalshiCredential = pgTable("KalshiCredential", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  userId: uuid("userId")
    .notNull()
    .references(() => user.id)
    .unique(),
  apiKeyEncrypted: text("apiKeyEncrypted").notNull(),
  privateKeyEncrypted: text("privateKeyEncrypted").notNull(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  lastUsedAt: timestamp("lastUsedAt"),
});

export type KalshiCredential = InferSelectModel<typeof kalshiCredential>;

export const trade = pgTable("Trade", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  userId: uuid("userId")
    .notNull()
    .references(() => user.id),
  orderId: text("orderId").notNull(),
  ticker: text("ticker").notNull(),
  side: varchar("side", { enum: ["yes", "no"] }).notNull(),
  action: varchar("action", { enum: ["buy", "sell"] }).notNull(),
  count: integer("count").notNull(),
  priceCents: integer("priceCents").notNull(),
  totalCostCents: integer("totalCostCents").notNull(),
  strategy: text("strategy"),
  notes: text("notes"),
  status: varchar("status", { enum: ["open", "closed", "cancelled"] })
    .notNull()
    .default("open"),
  closedAt: timestamp("closedAt"),
  exitPriceCents: integer("exitPriceCents"),
  pnlCents: integer("pnlCents"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
});

export type Trade = InferSelectModel<typeof trade>;

// ─── Audit tables ─────────────────────────────────────────────────────────────

export const toolCall = pgTable("ToolCall", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  userId: uuid("userId")
    .notNull()
    .references(() => user.id),
  chatId: uuid("chatId")
    .notNull()
    .references(() => chat.id),
  stepIndex: integer("stepIndex").notNull(),
  toolName: varchar("toolName", { length: 64 }).notNull(),
  input: json("input").notNull(),
  result: json("result").notNull(),
  resultChars: integer("resultChars").notNull(),
  summarized: boolean("summarized").notNull().default(false),
  summaryChars: integer("summaryChars"),
  durationMs: integer("durationMs").notNull(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
});

export type ToolCall = InferSelectModel<typeof toolCall>;

export const aiCall = pgTable("AiCall", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  userId: uuid("userId")
    .notNull()
    .references(() => user.id),
  chatId: uuid("chatId")
    .notNull()
    .references(() => chat.id),
  stepIndex: integer("stepIndex").notNull(),
  model: varchar("model", { length: 128 }).notNull(),
  inputTokens: integer("inputTokens"),
  outputTokens: integer("outputTokens"),
  totalTokens: integer("totalTokens"),
  cacheReadTokens: integer("cacheReadTokens"),
  cacheWriteTokens: integer("cacheWriteTokens"),
  reasoningTokens: integer("reasoningTokens"),
  toolCallCount: integer("toolCallCount").notNull().default(0),
  finishReason: varchar("finishReason", { length: 32 }),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
});

export type AiCall = InferSelectModel<typeof aiCall>;
