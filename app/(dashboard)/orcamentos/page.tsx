import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db";
import { budgets, clients } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { formatBRL } from "@/lib/format";
import OrcamentosListClient from "@/components/OrcamentosListClient";

export const dynamic = "force-dynamic";

export default async function OrcamentosPage() {
  const user = await getCurrentUser();
  const rows = await db
    .select({
      id: budgets.id,
      numero: budgets.numero,
      status: budgets.status,
      total: budgets.total,
      createdAt: budgets.createdAt,
      clientName: clients.nome,
    })
    .from(budgets)
    .innerJoin(clients, eq(budgets.clientId, clients.id))
    .where(eq(budgets.companyId, user!.companyId))
    .orderBy(desc(budgets.createdAt));

  const total = rows.reduce((s, b) => s + b.total, 0);
  const totalAprovado = rows.filter((b) => b.status === "Aprovado").reduce((s, b) => s + b.total, 0);
  const countByStatus = (status: string) => rows.filter((b) => b.status === status).length;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Orçamentos</h1>
          <p className="text-slate-500 text-sm mt-1">{rows.length} orçamentos registrados</p>
        </div>
        <Link
          href="/orcamentos/novo"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-md"
        >
          Novo orçamento
        </Link>
      </div>

      <div className="flex flex-wrap divide-x divide-slate-200 bg-white rounded-lg border border-slate-200">
        <div className="flex-1 min-w-[120px] px-5 py-4">
          <div className="text-xs text-slate-500 mb-1">Rascunhos</div>
          <div className="text-xl font-semibold text-slate-900">{countByStatus("Rascunho")}</div>
        </div>
        <div className="flex-1 min-w-[120px] px-5 py-4">
          <div className="text-xs text-slate-500 mb-1">Enviados</div>
          <div className="text-xl font-semibold text-blue-600">{countByStatus("Enviado")}</div>
        </div>
        <div className="flex-1 min-w-[120px] px-5 py-4">
          <div className="text-xs text-slate-500 mb-1">Aprovados</div>
          <div className="text-xl font-semibold text-emerald-600">{countByStatus("Aprovado")}</div>
        </div>
        <div className="flex-1 min-w-[120px] px-5 py-4">
          <div className="text-xs text-slate-500 mb-1">Recusados</div>
          <div className="text-xl font-semibold text-rose-600">{countByStatus("Recusado")}</div>
        </div>
        <div className="flex-1 min-w-[160px] px-5 py-4">
          <div className="text-xs text-slate-500 mb-1">Valor total em propostas</div>
          <div className="text-xl font-semibold text-slate-900">{formatBRL(total)}</div>
        </div>
        <div className="flex-1 min-w-[160px] px-5 py-4">
          <div className="text-xs text-slate-500 mb-1">Valor aprovado</div>
          <div className="text-xl font-semibold text-emerald-600">{formatBRL(totalAprovado)}</div>
        </div>
      </div>

      <OrcamentosListClient budgets={rows} />
    </div>
  );
}
