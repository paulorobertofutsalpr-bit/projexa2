CREATE TABLE "contracts" (
	"id" text PRIMARY KEY NOT NULL,
	"company_id" text NOT NULL,
	"client_id" text NOT NULL,
	"budget_id" text,
	"project_id" text,
	"numero" text NOT NULL,
	"objeto" text,
	"valor" integer DEFAULT 0 NOT NULL,
	"condicao_pagamento" text,
	"prazo_execucao" text,
	"clausulas" text,
	"status" text DEFAULT 'Rascunho' NOT NULL,
	"public_token" text NOT NULL,
	"assinado_nome" text,
	"assinado_cpf" text,
	"assinado_ip" text,
	"assinado_em" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "contracts_public_token_unique" UNIQUE("public_token")
);
--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "portal_token" text;--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN "visivel_cliente" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_budget_id_budgets_id_fk" FOREIGN KEY ("budget_id") REFERENCES "public"."budgets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clients" ADD CONSTRAINT "clients_portal_token_unique" UNIQUE("portal_token");