CREATE TABLE "project_notes" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"user_id" text NOT NULL,
	"user_name" text NOT NULL,
	"texto" text NOT NULL,
	"edited_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "budgets" ADD COLUMN "forma_pagamento" text;--> statement-breakpoint
ALTER TABLE "budgets" ADD COLUMN "previsao_inicio" text;--> statement-breakpoint
ALTER TABLE "budgets" ADD COLUMN "local_execucao" text;--> statement-breakpoint
ALTER TABLE "budgets" ADD COLUMN "responsavel_tecnico" text;--> statement-breakpoint
ALTER TABLE "budgets" ADD COLUMN "garantia" text;--> statement-breakpoint
ALTER TABLE "project_notes" ADD CONSTRAINT "project_notes_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_notes" ADD CONSTRAINT "project_notes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;