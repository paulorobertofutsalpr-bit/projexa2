ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "report_color_primary" text DEFAULT '#0B1D3A' NOT NULL;--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "report_color_secondary" text DEFAULT '#2563EB' NOT NULL;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "portal_token" text;--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'projects_portal_token_unique'
  ) THEN
    ALTER TABLE "projects" ADD CONSTRAINT "projects_portal_token_unique" UNIQUE("portal_token");
  END IF;
END $$;
