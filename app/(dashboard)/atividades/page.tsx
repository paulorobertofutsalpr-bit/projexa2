import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db";
import { activityLogs } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function AtividadesPage() {
  const user = await getCurrentUser();
  const rows = await db
    .select()
    .from(activityLogs)
    .where(eq(activityLogs.companyId, user!.companyId))
    .orderBy(desc(activityLogs.createdAt))
    .limit(200);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Log de atividades</h1>
        <p className="text-slate-500 text-sm mt-1">Últimas {rows.length} ações registradas no sistema</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg divide-y divide-slate-100">
        {rows.map((log) => (
          <div key={log.id} className="px-4 py-3 text-sm flex items-start gap-3">
            <span className="text-slate-400 shrink-0 w-36">
              {new Date(log.createdAt).toLocaleString("pt-BR")}
            </span>
            <span className="text-slate-700">
              <span className="font-medium text-slate-900">{log.userName}</span> {log.action}
            </span>
          </div>
        ))}
        {rows.length === 0 && <p className="text-sm text-slate-400 text-center py-8">Nenhuma atividade registrada ainda.</p>}
      </div>
    </div>
  );
}
