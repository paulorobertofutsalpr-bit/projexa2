import { db } from "@/db";
import { companies } from "@/db/schema";
import { desc, sql } from "drizzle-orm";
import AdminCompanyRow from "@/components/AdminCompanyRow";

export const dynamic = "force-dynamic";

export default async function PainelEmpresasPage() {
  const rows = await db
    .select({
      id: companies.id,
      name: companies.name,
      email: companies.email,
      phone: companies.phone,
      subscriptionStatus: companies.subscriptionStatus,
      subscriptionPriceCents: companies.subscriptionPriceCents,
      subscriptionOverdueSince: companies.subscriptionOverdueSince,
      lifetimeAccess: companies.lifetimeAccess,
      createdAt: companies.createdAt,
      userCount: sql<number>`(select count(*)::int from "users" where "users"."company_id" = "companies"."id")`,
    })
    .from(companies)
    .orderBy(desc(companies.createdAt));

  return (
    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
      <table className="w-full">
        <thead className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wide">
          <tr>
            <th className="text-left px-4 py-2 font-medium">Empresa</th>
            <th className="text-left px-4 py-2 font-medium">Usuários</th>
            <th className="text-left px-4 py-2 font-medium">Status</th>
            <th className="text-left px-4 py-2 font-medium">Valor</th>
            <th className="text-right px-4 py-2 font-medium"></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((c) => (
            <AdminCompanyRow
              key={c.id}
              company={{
                ...c,
                createdAt: c.createdAt.toISOString(),
                subscriptionOverdueSince: c.subscriptionOverdueSince ? c.subscriptionOverdueSince.toISOString() : null,
              }}
            />
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={5} className="px-4 py-8 text-center text-sm text-slate-400">
                Nenhuma empresa cadastrada ainda.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
