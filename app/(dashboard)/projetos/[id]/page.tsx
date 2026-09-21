import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db";
import { projects, clients, budgets } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { formatBRL } from "@/lib/format";
import StatusBadge from "@/components/StatusBadge";
import ProjectDocuments from "@/components/ProjectDocuments";
import ProjectActions from "@/components/ProjectActions";
import ProjectHistory from "@/components/ProjectHistory";

export const dynamic = "force-dynamic";

export default async function ProjetoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();

  const rows = await db
    .select({
      id: projects.id,
      numero: projects.numero,
      nome: projects.nome,
      descricao: projects.descricao,
      status: projects.status,
      progresso: projects.progresso,
      prazo: projects.prazo,
      prioridade: projects.prioridade,
      client: clients,
      budgetId: projects.budgetId,
    })
    .from(projects)
    .innerJoin(clients, eq(projects.clientId, clients.id))
    .where(and(eq(projects.id, id), eq(projects.companyId, user!.companyId)));

  const project = rows[0];
  if (!project) notFound();

  let originBudget: { numero: string; total: number } | null = null;
  if (project.budgetId) {
    const b = await db.select().from(budgets).where(eq(budgets.id, project.budgetId));
    if (b[0]) originBudget = { numero: b[0].numero, total: b[0].total };
  }

  return (
    <div className="max-w-2xl space-y-5">
      <div>
        <Link href="/projetos" className="text-sm text-blue-600 hover:underline">
          ← Voltar para projetos
        </Link>
        <div className="flex items-center justify-between mt-2">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">{project.nome}</h1>
            <p className="text-slate-500 text-sm">
              {project.numero} · {project.client.nome}
            </p>
          </div>
          <StatusBadge status={project.status} />
        </div>
        <div className="mt-3">
          <ProjectActions projectId={project.id} status={project.status} />
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-3">
        <div>
          <div className="text-xs text-slate-400 mb-1">Progresso</div>
          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600 rounded-full" style={{ width: `${project.progresso}%` }} />
          </div>
          <div className="text-xs text-slate-500 mt-1">{project.progresso}%</div>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-xs text-slate-400">Prazo</div>
            <div className="text-slate-800">{project.prazo || "—"}</div>
          </div>
          <div>
            <div className="text-xs text-slate-400">Prioridade</div>
            <div className="text-slate-800">{project.prioridade}</div>
          </div>
        </div>
        {project.descricao && (
          <div>
            <div className="text-xs text-slate-400 mb-1">Descrição</div>
            <p className="text-sm text-slate-700 whitespace-pre-line">{project.descricao}</p>
          </div>
        )}
      </div>

      {originBudget && (
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-sm text-blue-800">
          Origem: orçamento{" "}
          <Link href={`/orcamentos/${project.budgetId}`} className="underline font-medium">
            {originBudget.numero}
          </Link>{" "}
          — {formatBRL(originBudget.total)}
        </div>
      )}

      <div>
        <h2 className="text-sm font-medium text-slate-700 mb-3">Documentos</h2>
        <ProjectDocuments projectId={project.id} />
      </div>

      <div>
        <h2 className="text-sm font-medium text-slate-700 mb-3">Histórico do projeto</h2>
        <ProjectHistory projectId={project.id} currentUserId={user!.id} isAdmin={user!.role === "ADMIN"} />
      </div>
    </div>
  );
}
