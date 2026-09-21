import { notFound } from "next/navigation";
import { db } from "@/db";
import { clients, companies, projects, documents, budgets } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { formatBRL, formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default async function PortalClientePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  const clientRows = await db.select().from(clients).where(eq(clients.portalToken, token));
  const client = clientRows[0];
  if (!client) notFound();

  const company = (await db.select().from(companies).where(eq(companies.id, client.companyId)))[0];
  const clientProjects = await db.select().from(projects).where(eq(projects.clientId, client.id));
  const clientBudgets = await db.select().from(budgets).where(eq(budgets.clientId, client.id));

  const projectIds = clientProjects.map((p) => p.id);
  const visibleDocs = projectIds.length
    ? (
        await Promise.all(
          projectIds.map((pid) =>
            db.select().from(documents).where(and(eq(documents.projectId, pid), eq(documents.visivelCliente, true)))
          )
        )
      ).flat()
    : [];

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="text-white" style={{ backgroundColor: "#0B1D3A" }}>
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
          <h1 className="text-2xl font-semibold">Olá, {client.nome}</h1>
          <p className="text-blue-200 text-sm mt-1">Acompanhe aqui seus projetos e documentos</p>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        <div>
          <h2 className="text-sm font-medium text-slate-700 mb-3">Seus projetos</h2>
          <div className="grid gap-3">
            {clientProjects.map((p) => (
              <div key={p.id} className="bg-white border border-slate-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-slate-900">{p.nome}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">{p.status}</span>
                </div>
                <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden mb-1">
                  <div className="h-full bg-blue-600 rounded-full" style={{ width: `${p.progresso}%` }} />
                </div>
                <div className="text-xs text-slate-400">
                  {p.progresso}% concluído {p.prazo ? `· Prazo: ${p.prazo}` : ""}
                </div>
              </div>
            ))}
            {clientProjects.length === 0 && <p className="text-sm text-slate-400">Nenhum projeto no momento.</p>}
          </div>
        </div>

        {clientBudgets.length > 0 && (
          <div>
            <h2 className="text-sm font-medium text-slate-700 mb-3">Propostas</h2>
            <div className="bg-white border border-slate-200 rounded-lg divide-y divide-slate-100">
              {clientBudgets.map((b) => (
                <div key={b.id} className="flex items-center justify-between px-4 py-3 text-sm">
                  <span className="text-slate-700">{b.numero}</span>
                  <span className="text-slate-500">{formatBRL(b.total)}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{b.status}</span>
                </div>
              ))}
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
