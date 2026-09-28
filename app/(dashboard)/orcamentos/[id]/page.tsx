import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db";
import { budgets, budgetItems, clients, companies } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { formatBRL, formatDate } from "@/lib/format";
import StatusBadge from "@/components/StatusBadge";
import OrcamentoActions from "@/components/OrcamentoActions";
import ContractPartiesHeader from "@/components/ContractPartiesHeader";
import ScopeList from "@/components/ScopeList";

export const dynamic = "force-dynamic";

export default async function OrcamentoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();

  const rows = await db
    .select({
      id: budgets.id,
      numero: budgets.numero,
      status: budgets.status,
      total: budgets.total,
      objeto: budgets.objeto,
      validadeDias: budgets.validadeDias,
      condicaoPagamento: budgets.condicaoPagamento,
      formaPagamento: budgets.formaPagamento,
      prazoExecucao: budgets.prazoExecucao,
      previsaoInicio: budgets.previsaoInicio,
      localExecucao: budgets.localExecucao,
      responsavelTecnico: budgets.responsavelTecnico,
      garantia: budgets.garantia,
      escopoIncluso: budgets.escopoIncluso,
      escopoNaoIncluso: budgets.escopoNaoIncluso,
      observacoesComerciais: budgets.observacoesComerciais,
      createdAt: budgets.createdAt,
      publicToken: budgets.publicToken,
      approvedAt: budgets.approvedAt,
      client: clients,
      company: companies,
    })
    .from(budgets)
    .innerJoin(clients, eq(budgets.clientId, clients.id))
    .innerJoin(companies, eq(budgets.companyId, companies.id))
    .where(and(eq(budgets.id, id), eq(budgets.companyId, user!.companyId)));

  const budget = rows[0];
  if (!budget) notFound();

  const items = await db.select().from(budgetItems).where(eq(budgetItems.budgetId, id));

  const dataValidade = new Date(budget.createdAt);
  dataValidade.setDate(dataValidade.getDate() + budget.validadeDias);

  return (
    <div className="max-w-2xl space-y-5">
      <div>
        <Link href="/orcamentos" className="text-sm text-blue-600 hover:underline">
          ← Voltar para orçamentos
        </Link>
        <div className="flex items-center justify-between mt-2">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">{budget.numero}</h1>
            <p className="text-slate-500 text-sm">{budget.client.nome}</p>
          </div>
          <StatusBadge status={budget.status} />
        </div>
      </div>

      <ContractPartiesHeader company={budget.company} client={budget.client} />

      {budget.objeto && (
        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <h2 className="text-xs uppercase tracking-wide text-slate-400 mb-2">Objeto da proposta</h2>
          <p className="text-sm text-slate-700 whitespace-pre-line">{budget.objeto}</p>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-lg divide-y divide-slate-100">
        {items.map((i) => (
          <div key={i.id} className="px-5 py-3 text-sm">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-slate-700">{i.nome}</span>
                <span className="text-xs text-slate-400 ml-2">
                  {i.quantidade} {i.unidade} × {formatBRL(i.valorUnitario)}
                  {i.desconto > 0 ? ` − ${formatBRL(i.desconto)} desc.` : ""}
                </span>
              </div>
              <span className="font-medium text-slate-900">{formatBRL(i.valor)}</span>
            </div>
            {i.observacoes && <div className="text-xs text-slate-400 mt-1">{i.observacoes}</div>}
          </div>
        ))}
        <div className="flex items-center justify-between px-5 py-3">
          <span className="text-sm font-medium text-slate-600">Total</span>
          <span className="text-lg font-semibold text-slate-900">{formatBRL(budget.total)}</span>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-5 grid grid-cols-2 gap-4 text-sm">
        <div>
          <div className="text-xs text-slate-400">Validade</div>
          <div className="text-slate-800">{formatDate(dataValidade)} ({budget.validadeDias} dias)</div>
        </div>
        {budget.previsaoInicio && (
          <div>
            <div className="text-xs text-slate-400">Previsão de início</div>
            <div className="text-slate-800">{budget.previsaoInicio}</div>
          </div>
        )}
        {budget.prazoExecucao && (
          <div>
            <div className="text-xs text-slate-400">Prazo de execução</div>
            <div className="text-slate-800">{budget.prazoExecucao}</div>
          </div>
        )}
        {budget.localExecucao && (
          <div>
            <div className="text-xs text-slate-400">Local de execução</div>
            <div className="text-slate-800">{budget.localExecucao}</div>
          </div>
        )}
        {budget.condicaoPagamento && (
          <div>
            <div className="text-xs text-slate-400">Condição de pagamento</div>
            <div className="text-slate-800">{budget.condicaoPagamento}</div>
          </div>
        )}
        {budget.formaPagamento && (
          <div>
            <div className="text-xs text-slate-400">Forma de pagamento</div>
            <div className="text-slate-800">{budget.formaPagamento}</div>
          </div>
        )}
        {budget.responsavelTecnico && (
          <div>
            <div className="text-xs text-slate-400">Responsável técnico</div>
            <div className="text-slate-800">{budget.responsavelTecnico}</div>
          </div>
        )}
        {budget.garantia && (
          <div>
            <div className="text-xs text-slate-400">Garantia</div>
            <div className="text-slate-800">{budget.garantia}</div>
          </div>
        )}
      </div>

      {budget.observacoesComerciais && (
        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <h2 className="text-xs uppercase tracking-wide text-slate-400 mb-2">Observações comerciais</h2>
          <p className="text-sm text-slate-700 whitespace-pre-line">{budget.observacoesComerciais}</p>
        </div>
      )}

      {(budget.escopoIncluso || budget.escopoNaoIncluso) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ScopeList title="O que está incluso" text={budget.escopoIncluso} tone="positive" />
          <ScopeList title="O que não está incluso" text={budget.escopoNaoIncluso} tone="negative" />
        </div>
      )}

      {budget.approvedAt && (
        <div className="text-sm text-emerald-700 bg-emerald-50 border-l-4 border-emerald-300 px-4 py-2 rounded-r-md">
          Aprovado pelo cliente em {formatDate(budget.approvedAt)}
        </div>
      )}

      <OrcamentoActions budgetId={budget.id} status={budget.status} publicToken={budget.publicToken} />
    </div>
  );
}
