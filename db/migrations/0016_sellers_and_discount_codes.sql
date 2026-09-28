CREATE TABLE IF NOT EXISTS "discount_codes" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"kind" text NOT NULL,
	"value" integer DEFAULT 0 NOT NULL,
	"max_uses" integer,
	"uses_count" integer DEFAULT 0 NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "discount_codes_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sellers" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text,
	"code" text NOT NULL,
	"commission_percent" integer DEFAULT 10 NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "sellers_code_unique" UNIQUE("code")
);
--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "cancelled_at" timestamp;--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "lifetime_access" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "seller_id" text;--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "discount_code_id" text;
