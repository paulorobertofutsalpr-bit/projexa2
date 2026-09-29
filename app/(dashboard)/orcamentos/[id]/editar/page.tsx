import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db";
import { budgets, budgetItems, clients } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import NovoOrcamentoForm from "@/components/NovoOrcamentoForm";

export const dynamic = "force-dynamic";

export default async function EditarOrcamentoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();

  const rows = await db
    .select()
    .from(budgets)
    .where(and(eq(budgets.id, id), eq(budgets.companyId, user!.companyId)));
  const budget = rows[0];
  if (!budget) notFound();

  const itemRows = await db.select().from(budgetItems).where(eq(budgetItems.budgetId, id));
  const clientRows = await db.select().from(clients).where(eq(clients.companyId, user!.companyId));

  return (
    <NovoOrcamentoForm
      clients={clientRows}
      budgetId={budget.id}
      initial={{
        clientId: budget.clientId,
        objeto: budget.objeto || "",
        validadeDias: String(budget.validadeDias),
        condicaoPagamento: budget.condicaoPagamento || "",
        formaPagamento: budget.formaPagamento || "",
        prazoExecucao: budget.prazoExecucao || "",
        previsaoInicio: budget.previsaoInicio || "",
        localExecucao: budget.localExecucao || "",
        responsavelTecnico: budget.responsavelTecnico || "",
        garantia: budget.garantia || "",
        escopoIncluso: budget.escopoIncluso || "",
        escopoNaoIncluso: budget.escopoNaoIncluso || "",
        observacoesComerciais: budget.observacoesComerciais || "",
        items: itemRows.map((i) => ({
          id: i.id,
          categoria: i.categoria,
          nome: i.nome,
          observacoes: i.observacoes || "",
          quantidade: String(i.quantidade),
          unidade: i.unidade,
          valorUnitario: (i.valorUnitario / 100).toFixed(2),
          desconto: (i.desconto / 100).toFixed(2),
        })),
      }}
    />
  );
}
