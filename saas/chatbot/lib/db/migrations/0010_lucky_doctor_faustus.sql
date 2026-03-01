CREATE TABLE IF NOT EXISTS "Trade" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"orderId" text NOT NULL,
	"ticker" text NOT NULL,
	"side" varchar NOT NULL,
	"action" varchar NOT NULL,
	"count" integer NOT NULL,
	"priceCents" integer NOT NULL,
	"totalCostCents" integer NOT NULL,
	"strategy" text,
	"notes" text,
	"status" varchar DEFAULT 'open' NOT NULL,
	"closedAt" timestamp,
	"exitPriceCents" integer,
	"pnlCents" integer,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Trade" ADD CONSTRAINT "Trade_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
