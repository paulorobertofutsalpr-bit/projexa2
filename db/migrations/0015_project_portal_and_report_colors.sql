ALTER TABLE "companies" ADD COLUMN "report_color_primary" text DEFAULT '#0B1D3A' NOT NULL;--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "report_color_secondary" text DEFAULT '#2563EB' NOT NULL;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "portal_token" text;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_portal_token_unique" UNIQUE("portal_token");