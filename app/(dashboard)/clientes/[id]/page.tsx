import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db";
import { clients, clientHistoryEvents } from "@/db/schema";
import { and, desc, eq } from "drizzle-orm";
import ClientPortalLink from "@/components/ClientPortalLink";

export const dynamic = "force-dynamic";

export default async function ClienteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();

  const rows = await db
    .select()
    .from(clients)
    .where(and(eq(clients.id, id), eq(clients.companyId, user!.companyId)));

  const client = rows[0];
  if (!client) notFound();

  const history = await db
    .select()
    .from(clientHistoryEvents)
    .where(eq(clientHistoryEvents.clientId, id))
    .orderBy(desc(clientHistoryEvents.createdAt));

  return (
    <div className="max-w-2xl space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/clientes" className="text-sm text-blue-600 hover:underline">
            ← Voltar para clientes
          </Link>
          <h1 className="text-2xl font-semibold text-slate-900 mt-2">{client.nome}</h1>
          <p className="text-slate-500 text-sm">{client.tipo}</p>
        </div>
        <Link
          href={`/clientes/${client.id}/editar`}
          className="px-3 py-1.5 text-sm border border-slate-200 rounded-md hover:bg-slate-50 h-fit"
        >
          Editar
        </Link>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <h2 className="text-xs uppercase tracking-wide text-slate-400 mb-3">Dados cadastrais</h2>
        <dl className="text-sm space-y-2">
          <div className="flex justify-between">
            <dt className="text-slate-500">Documento</dt>
            <dd className="text-slate-800">{client.documento || "—"}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-500">Telefone</dt>
            <dd className="text-slate-800">{client.telefone || "—"}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-500">E-mail</dt>
            <dd className="text-slate-800">{client.email || "—"}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-500">Endereço</dt>
            <dd className="text-slate-800 text-right">
              {client.endereco ? `${client.endereco}${client.bairro ? ", " + client.bairro : ""}` : "—"}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-500">Cidade</dt>
            <dd className="text-slate-800">
              {client.cidade ? `${client.cidade}/${client.estado ?? ""}` : "—"}
            </dd>
          </div>
          {client.cep && (
            <div className="flex justify-between">
              <dt className="text-slate-500">CEP</dt>
              <dd className="text-slate-800">{client.cep}</dd>
            </div>
          )}
          {client.observacoes && (
            <div className="pt-2 border-t border-slate-100">
              <dt className="text-slate-500 mb-1">Observações</dt>
              <dd className="text-slate-800">{client.observacoes}</dd>
            </div>
          )}
        </dl>
      </div>

      <ClientPortalLink clientId={client.id} portalToken={client.portalToken} />

      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <h2 className="text-xs uppercase tracking-wide text-slate-400 mb-3">Histórico</h2>
        <div className="space-y-3">
          {history.map((h) => (
            <div key={h.id} className="flex gap-3 text-sm">
              <span className="text-slate-400 shrink-0">
                {new Date(h.createdAt).toLocaleDateString("pt-BR")}
              </span>
              <span className="text-slate-700">{h.description}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
