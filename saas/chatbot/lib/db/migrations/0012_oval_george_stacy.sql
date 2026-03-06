CREATE TABLE IF NOT EXISTS "Strategy" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"name" varchar(128) NOT NULL,
	"playbook" varchar NOT NULL,
	"instrumentType" varchar DEFAULT 'prediction_market' NOT NULL,
	"budgetCents" integer NOT NULL,
	"config" json DEFAULT '{}'::json NOT NULL,
	"status" varchar DEFAULT 'active' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "Trade" ADD COLUMN "strategyId" uuid;--> statement-breakpoint
ALTER TABLE "User" ADD COLUMN "allocatedCapitalCents" integer;--> statement-breakpoint
ALTER TABLE "User" ADD COLUMN "maxExposurePct" integer DEFAULT 60;--> statement-breakpoint
ALTER TABLE "User" ADD COLUMN "dailyLossLimitCents" integer;--> statement-breakpoint
ALTER TABLE "User" ADD COLUMN "drawdownPausePct" integer DEFAULT 20;--> statement-breakpoint
ALTER TABLE "User" ADD COLUMN "maxCorrelatedTrades" integer DEFAULT 3;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Strategy" ADD CONSTRAINT "Strategy_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Trade" ADD CONSTRAINT "Trade_strategyId_Strategy_id_fk" FOREIGN KEY ("strategyId") REFERENCES "public"."Strategy"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
