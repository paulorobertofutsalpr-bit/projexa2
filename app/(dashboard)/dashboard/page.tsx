import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db";
import { clients, users } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const companyId = user!.companyId;

  const clientRows = await db.select().from(clients).where(eq(clients.companyId, companyId));
  const userRows = await db.select().from(users).where(eq(users.companyId, companyId));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Painel</h1>
        <p className="text-slate-500 text-sm mt-1">
          Bem-vindo(a), {user!.name} — {user!.companyName}
        </p>
      </div>

      <div className="flex flex-wrap divide-x divide-slate-200 bg-white rounded-lg border border-slate-200">
        <div className="flex-1 min-w-[160px] px-5 py-4">
          <div className="text-xs text-slate-500 mb-1">Clientes cadastrados</div>
          <div className="text-2xl font-semibold text-slate-900">{clientRows.length}</div>
        </div>
        <div className="flex-1 min-w-[160px] px-5 py-4">
          <div className="text-xs text-slate-500 mb-1">Usuários da empresa</div>
          <div className="text-2xl font-semibold text-slate-900">{userRows.length}</div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <h2 className="text-sm font-medium text-slate-700 mb-2">Próximas fases</h2>
        <p className="text-sm text-slate-500">
          Orçamentos e propostas, projetos, financeiro e documentos entram nas próximas
          entregas, seguindo o roadmap em PROJEXA-ARQUITETURA.md.
        </p>
      </div>
    </div>
  );
}
