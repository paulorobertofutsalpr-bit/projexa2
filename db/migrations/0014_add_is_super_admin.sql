ALTER TABLE "users" ADD COLUMN "is_super_admin" boolean DEFAULT false NOT NULL;--> statement-breakpoint
UPDATE "users" SET "is_super_admin" = true WHERE "email" = 'admin@projexa.com.br';
