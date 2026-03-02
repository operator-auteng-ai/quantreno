CREATE TABLE IF NOT EXISTS "AiCall" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"chatId" uuid NOT NULL,
	"stepIndex" integer NOT NULL,
	"model" varchar(128) NOT NULL,
	"inputTokens" integer,
	"outputTokens" integer,
	"totalTokens" integer,
	"cacheReadTokens" integer,
	"cacheWriteTokens" integer,
	"reasoningTokens" integer,
	"toolCallCount" integer DEFAULT 0 NOT NULL,
	"finishReason" varchar(32),
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ToolCall" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"chatId" uuid NOT NULL,
	"stepIndex" integer NOT NULL,
	"toolName" varchar(64) NOT NULL,
	"input" json NOT NULL,
	"result" json NOT NULL,
	"resultChars" integer NOT NULL,
	"summarized" boolean DEFAULT false NOT NULL,
	"summaryChars" integer,
	"durationMs" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "AiCall" ADD CONSTRAINT "AiCall_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "AiCall" ADD CONSTRAINT "AiCall_chatId_Chat_id_fk" FOREIGN KEY ("chatId") REFERENCES "public"."Chat"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ToolCall" ADD CONSTRAINT "ToolCall_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ToolCall" ADD CONSTRAINT "ToolCall_chatId_Chat_id_fk" FOREIGN KEY ("chatId") REFERENCES "public"."Chat"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
