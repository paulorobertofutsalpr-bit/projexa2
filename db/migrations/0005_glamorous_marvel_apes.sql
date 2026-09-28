CREATE TABLE "projects" (
	"id" text PRIMARY KEY NOT NULL,
	"company_id" text NOT NULL,
	"client_id" text NOT NULL,
	"budget_id" text,
	"numero" text NOT NULL,
	"nome" text NOT NULL,
	"descricao" text,
	"status" text DEFAULT 'Planejamento' NOT NULL,
	"progresso" integer DEFAULT 0 NOT NULL,
	"prioridade" text DEFAULT 'Média' NOT NULL,
	"prazo" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "budget_items" ALTER COLUMN "valor_unitario" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_budget_id_budgets_id_fk" FOREIGN KEY ("budget_id") REFERENCES "public"."budgets"("id") ON DELETE no action ON UPDATE no action;