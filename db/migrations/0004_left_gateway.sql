ALTER TABLE "budget_items" ADD COLUMN "categoria" text DEFAULT 'Serviço' NOT NULL;--> statement-breakpoint
ALTER TABLE "budget_items" ADD COLUMN "quantidade" double precision DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "budget_items" ADD COLUMN "unidade" text DEFAULT 'Serviço' NOT NULL;--> statement-breakpoint
ALTER TABLE "budget_items" ADD COLUMN "valor_unitario" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "budget_items" ADD COLUMN "desconto" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "budgets" ADD COLUMN "objeto" text;--> statement-breakpoint
ALTER TABLE "budgets" ADD COLUMN "validade_dias" integer DEFAULT 15 NOT NULL;--> statement-breakpoint
ALTER TABLE "budgets" ADD COLUMN "condicao_pagamento" text;--> statement-breakpoint
ALTER TABLE "budgets" ADD COLUMN "prazo_execucao" text;--> statement-breakpoint
ALTER TABLE "budgets" ADD COLUMN "escopo_incluso" text;--> statement-breakpoint
ALTER TABLE "budgets" ADD COLUMN "escopo_nao_incluso" text;--> statement-breakpoint
ALTER TABLE "budgets" ADD COLUMN "observacoes_comerciais" text;