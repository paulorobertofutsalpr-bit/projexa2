ALTER TABLE "sellers" ADD COLUMN IF NOT EXISTS "portal_token" text;
--> statement-breakpoint
DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1 FROM pg_constraint WHERE conname = 'sellers_portal_token_unique'
	) THEN
		ALTER TABLE "sellers" ADD CONSTRAINT "sellers_portal_token_unique" UNIQUE("portal_token");
	END IF;
END $$;
