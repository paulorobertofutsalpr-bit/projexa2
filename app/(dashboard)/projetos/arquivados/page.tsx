import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db";
import { projects, clients } from "@/db/schema";
import { and, eq, isNotNull } from "drizzle-orm";
import { formatDate } from "@/lib/format";
import RestoreProjectButton from "@/components/RestoreProjectButton";

export const dynamic = "force-dynamic";

export default async function ProjetosArquivadosPage() {
  const user = await getCurrentUser();

  const rows = await db
    .select({
      id: projects.id,
      numero: projects.numero,
      nome: projects.nome,
      arquivadoEm: projects.arquivadoEm,
      clientName: clients.nome,
    })
    .from(projects)
    .innerJoin(clients, eq(projects.clientId, clients.id))
    .where(and(eq(projects.companyId, user!.companyId), isNotNull(projects.arquivadoEm)));

  return (
    <div className="space-y-5">
      <div>
        <Link href="/projetos" className="text-sm text-blue-600 hover:underline">
          ← Voltar para projetos
        </Link>
        <h1 className="text-2xl font-semibold text-slate-900 mt-2">Projetos arquivados</h1>
        <p className="text-slate-500 text-sm mt-1">{rows.length} projetos arquivados</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg divide-y divide-slate-100">
        {rows.map((p) => (
          <div key={p.id} className="flex items-center justify-between px-4 py-3 text-sm">
            <div>
              <Link href={`/projetos/${p.id}`} className="font-medium text-slate-900 hover:text-blue-600">
                {p.nome}
              </Link>
              <div className="text-xs text-slate-400">
                {p.numero} · {p.clientName} · arquivado em {p.arquivadoEm ? formatDate(p.arquivadoEm) : ""}
              </div>
            </div>
            <RestoreProjectButton projectId={p.id} />
          </div>
        ))}
        {rows.length === 0 && <p className="text-sm text-slate-400 text-center py-8">Nenhum projeto arquivado.</p>}
      </div>
    </div>
  );
}
