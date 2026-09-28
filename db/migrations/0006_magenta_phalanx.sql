CREATE TABLE "documents" (
	"id" text PRIMARY KEY NOT NULL,
	"company_id" text NOT NULL,
	"project_id" text NOT NULL,
	"group_id" text NOT NULL,
	"categoria" text DEFAULT 'Outros' NOT NULL,
	"nome" text NOT NULL,
	"tipo" text NOT NULL,
	"tamanho" integer NOT NULL,
	"conteudo" text NOT NULL,
	"versao" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;