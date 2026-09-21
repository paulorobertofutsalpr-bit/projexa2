CREATE TABLE "numbering_sequences" (
	"id" text PRIMARY KEY NOT NULL,
	"company_id" text NOT NULL,
	"tipo" text NOT NULL,
	"ano" integer NOT NULL,
	"prefixo" text NOT NULL,
	"ultimo_numero" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "arquivado_em" timestamp;--> statement-breakpoint
ALTER TABLE "numbering_sequences" ADD CONSTRAINT "numbering_sequences_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;