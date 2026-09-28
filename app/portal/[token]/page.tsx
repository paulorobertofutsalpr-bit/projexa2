import { notFound } from "next/navigation";
import { db } from "@/db";
import { clients, companies, projects, documents, budgets } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { formatBRL } from "@/lib/format";

export const dynamic = "force-dynamic";

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default async function PortalProjetoPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  const projectRows = await db.select().from(projects).where(eq(projects.portalToken, token));
  const project = projectRows[0];
  if (!project) notFound();

  const client = (await db.select().from(clients).where(eq(clients.id, project.clientId)))[0];
  const company = (await db.select().from(companies).where(eq(companies.id, project.companyId)))[0];

  const projectBudget = project.budgetId
    ? (await db.select().from(budgets).where(eq(budgets.id, project.budgetId)))[0]
    : null;

  const visibleDocs = await db
    .select()
    .from(documents)
    .where(and(eq(documents.projectId, project.id), eq(documents.visivelCliente, true)));

  const headerColor = company?.reportColorPrimary || "#0B1D3A";

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="text-white" style={{ backgroundColor: headerColor }}>
        <div className="max-w-3xl mx-auto px-6 py-8">
          <div className="flex items-center gap-2 mb-4">
            {company?.logoData ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={company.logoData} alt={company.name} className="w-8 h-8 rounded object-contain" />
            ) : (
              <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center font-semibold text-sm">Pj</div>
            )}
            <span className="font-semibold">{company?.name}</span>
          </div>
          <h1 className="text-2xl font-semibold">Olá, {client?.nome}</h1>
          <p className="text-blue-200 text-sm mt-1">Acompanhe aqui o andamento do projeto {project.nome}</p>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        <div>
          <h2 className="text-sm font-medium text-slate-700 mb-3">Projeto</h2>
          <div className="bg-white border border-slate-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-slate-900">{project.nome}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">{project.status}</span>
            </div>
            <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden mb-1">
              <div className="h-full bg-blue-600 rounded-full" style={{ width: `${project.progresso}%` }} />
            </div>
            <div className="text-xs text-slate-400">
              {project.progresso}% concluído {project.prazo ? `· Prazo: ${project.prazo}` : ""}
            </div>
            {project.descricao && (
              <p className="text-sm text-slate-600 mt-3 whitespace-pre-line">{project.descricao}</p>
            )}
          </div>
        </div>

        {projectBudget && (
          <div>
            <h2 className="text-sm font-medium text-slate-700 mb-3">Proposta de origem</h2>
            <div className="bg-white border border-slate-200 rounded-lg divide-y divide-slate-100">
              <div className="flex items-center justify-between px-4 py-3 text-sm">
                <span className="text-slate-700">{projectBudget.numero}</span>
                <span className="text-slate-500">{formatBRL(projectBudget.total)}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  {projectBudget.status}
                </span>
              </div>
            </div>
          </div>
        )}

        <div>
          <h2 className="text-sm font-medium text-slate-700 mb-3">Documentos liberados</h2>
          <div className="bg-white border border-slate-200 rounded-lg divide-y divide-slate-100">
            {visibleDocs.map((d) => (
              <div key={d.id} className="flex items-center justify-between px-4 py-3 text-sm">
                <div>
                  <div className="text-slate-800">{d.nome}</div>
                  <div className="text-xs text-slate-400">
                    {d.categoria} · {formatSize(d.tamanho)}
                  </div>
                </div>
                <a href={`/api/public/portal-documento/${d.id}`} className="text-blue-600 hover:underline text-xs">
                  Baixar
                </a>
              </div>
            ))}
            {visibleDocs.length === 0 && (
              <p className="text-sm text-slate-400 px-4 py-6 text-center">Nenhum documento liberado ainda.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
