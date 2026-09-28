CREATE TABLE "budget_items" (
	"id" text PRIMARY KEY NOT NULL,
	"budget_id" text NOT NULL,
	"nome" text NOT NULL,
	"valor" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "budgets" (
	"id" text PRIMARY KEY NOT NULL,
	"company_id" text NOT NULL,
	"client_id" text NOT NULL,
	"numero" text NOT NULL,
	"status" text DEFAULT 'Rascunho' NOT NULL,
	"total" integer DEFAULT 0 NOT NULL,
	"public_token" text NOT NULL,
	"approved_at" timestamp,
	"approved_ip" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "budgets_public_token_unique" UNIQUE("public_token")
);
--> statement-breakpoint
ALTER TABLE "budget_items" ADD CONSTRAINT "budget_items_budget_id_budgets_id_fk" FOREIGN KEY ("budget_id") REFERENCES "public"."budgets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "budgets" ADD CONSTRAINT "budgets_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "budgets" ADD CONSTRAINT "budgets_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;