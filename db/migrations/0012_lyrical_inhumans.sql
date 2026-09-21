ALTER TABLE "companies" ADD COLUMN "subscription_status" text DEFAULT 'trial' NOT NULL;--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "mp_preapproval_id" text;--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "mp_payer_email" text;--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "subscription_overdue_since" timestamp;