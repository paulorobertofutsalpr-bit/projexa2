import { db } from "@/db";
import { companies, users } from "@/db/schema";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string | number;
  accent?: "emerald" | "amber" | "rose" | "slate" | "blue";
}) {
  const color =
    accent === "emerald"
      ? "text-emerald-600 border-l-emerald-500"
      : accent === "amber"
        ? "text-amber-600 border-l-amber-500"
        : accent === "rose"
          ? "text-rose-600 border-l-rose-500"
          : accent === "blue"
            ? "text-blue-600 border-l-blue-500"
            : "text-slate-900 border-l-slate-300";

  return (
    <div className={`bg-white border border-slate-200 border-l-4 rounded-lg p-4 ${color.split(" ")[1]}`}>
      <div className="text-xs text-slate-400">{label}</div>
      <div className={`text-2xl font-semibold mt-1 ${color.split(" ")[0]}`}>{value}</div>
    </div>
  );
}

export default async function PainelSistemaDashboard() {
  const rows = await db
    .select({
      id: companies.id,
      subscriptionStatus: companies.subscriptionStatus,
      subscriptionPriceCents: companies.subscriptionPriceCents,
      lifetimeAccess: companies.lifetimeAccess,
      createdAt: companies.createdAt,
      cancelledAt: companies.cancelledAt,
    })
    .from(companies);

  const totalUsersRow = await db.select({ count: sql<number>`count(*)::int` }).from(users);
  const totalUsuarios = totalUsersRow[0]?.count ?? 0;

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const counts = rows.reduce<Record<string, number>>((acc, c) => {
    acc[c.subscriptionStatus] = (acc[c.subscriptionStatus] || 0) + 1;
    return acc;
  }, {});

  const novasEmpresasNoMes = rows.filter((c) => new Date(c.createdAt) >= monthStart).length;
  const cancelamentosNoMes = rows.filter((c) => c.cancelledAt && new Date(c.cancelledAt) >= monthStart).length;

  const mrrCents = rows
    .filter((c) => c.subscriptionStatus === "active" && !c.lifetimeAccess)
    .reduce((sum, c) => sum + c.subscriptionPriceCents, 0);
  const arrCents = mrrCents * 12;

  const fmt = (cents: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Total de usuários" value={totalUsuarios} />
        <StatCard label="Total de empresas" value={rows.length} />
        <StatCard label="Assinaturas ativas" value={counts.active || 0} accent="emerald" />
        <StatCard label="Pagamento atrasado" value={counts.overdue || 0} accent="amber" />
        <StatCard label="Bloqueadas" value={counts.blocked || 0} accent="rose" />
        <StatCard label="Canceladas" value={counts.cancelled || 0} accent="slate" />
        <StatCard label="Novas empresas no mês" value={novasEmpresasNoMes} accent="blue" />
        <StatCard label="Cancelamentos no mês" value={cancelamentosNoMes} accent="rose" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <div className="text-xs text-slate-400">MRR (receita recorrente mensal)</div>
          <div className="text-2xl font-semibold text-slate-900 mt-1">{fmt(mrrCents)}</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <div className="text-xs text-slate-400">ARR (receita recorrente anual)</div>
          <div className="text-2xl font-semibold text-slate-900 mt-1">{fmt(arrCents)}</div>
        </div>
      </div>
    </div>
  );
}
