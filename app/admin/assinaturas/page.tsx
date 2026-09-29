import { db } from "@/db";
import { companies, plans } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import AdminPageHeader from "@/components/AdminPageHeader";

export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<string, string> = {
  trial: "Sem assinatura ativa",
  pending: "Aguardando confirmação",
  active: "Ativa",
  overdue: "Pagamento pendente",
  blocked: "Bloqueada",
  cancelled: "Cancelada",
};

const STATUS_COLORS: Record<string, string> = {
  trial: "bg-slate-100 text-slate-600",
  pending: "bg-amber-100 text-amber-700",
  active: "bg-emerald-100 text-emerald-700",
  overdue: "bg-amber-100 text-amber-700",
  blocked: "bg-rose-100 text-rose-700",
  cancelled: "bg-slate-200 text-slate-500",
};

export default async function AdminAssinaturasPage() {
  const rows = await db
    .select({
      id: companies.id,
      name: companies.name,
      subscriptionStatus: companies.subscriptionStatus,
      subscriptionPriceCents: companies.subscriptionPriceCents,
      lifetimeAccess: companies.lifetimeAccess,
      subscriptionOverdueSince: companies.subscriptionOverdueSince,
      cancelledAt: companies.cancelledAt,
      createdAt: companies.createdAt,
      planName: plans.name,
    })
    .from(companies)
    .leftJoin(plans, eq(companies.planId, plans.id))
    .orderBy(desc(companies.createdAt));

  const fmt = (cents: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);
  const fmtDate = (d: Date | string | null) => (d ? new Date(d).toLocaleDateString("pt-BR") : "—");

  return (
    <div className="space-y-4">
      <AdminPageHeader
        title="Assinaturas"
        description="Todas as assinaturas de empresas do Projexa, com plano, valor e situação atual."
      />
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wide">
            <tr>
              <th className="text-left px-4 py-2 font-medium">Empresa</th>
              <th className="text-left px-4 py-2 font-medium">Plano</th>
              <th className="text-left px-4 py-2 font-medium">Valor</th>
              <th className="text-left px-4 py-2 font-medium">Status</th>
              <th className="text-left px-4 py-2 font-medium">Início</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-slate-100 last:border-0">
                <td className="px-4 py-3">
                  <div className="text-sm font-medium text-slate-900 flex items-center gap-1.5">
                    {r.name}
                    {r.lifetimeAccess && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-violet-100 text-violet-700">
                        Vitalício
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-slate-600">{r.planName || "—"}</td>
                <td className="px-4 py-3 text-sm text-slate-600">{fmt(r.subscriptionPriceCents)}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[r.subscriptionStatus] || "bg-slate-100 text-slate-600"}`}>
                    {STATUS_LABELS[r.subscriptionStatus] || r.subscriptionStatus}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-slate-500">{fmtDate(r.createdAt)}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-slate-400">
                  Nenhuma assinatura ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
