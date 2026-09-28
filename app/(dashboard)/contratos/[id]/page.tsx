import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db";
import { contracts, clients } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { formatBRL, formatDate } from "@/lib/format";
import StatusBadge from "@/components/StatusBadge";
import CopyLinkBox from "@/components/CopyLinkBox";

export const dynamic = "force-dynamic";

export default async function ContratoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();

  const rows = await db
    .select({
      id: contracts.id,
      numero: contracts.numero,
      objeto: contracts.objeto,
      valor: contracts.valor,
      status: contracts.status,
      publicToken: contracts.publicToken,
      assinadoNome: contracts.assinadoNome,
      assinadoCpf: contracts.assinadoCpf,
      assinadoIp: contracts.assinadoIp,
      assinadoEm: contracts.assinadoEm,
      clientName: clients.nome,
    })
    .from(contracts)
    .innerJoin(clients, eq(contracts.clientId, clients.id))
    .where(and(eq(contracts.id, id), eq(contracts.companyId, user!.companyId)));

  const contract = rows[0];
  if (!contract) notFound();

  return (
    <div className="max-w-2xl space-y-5">
      <div>
        <Link href="/clientes" className="text-sm text-blue-600 hover:underline">
          ← Voltar
        </Link>
        <div className="flex items-center justify-between mt-2">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">{contract.numero}</h1>
            <p className="text-slate-500 text-sm">{contract.clientName}</p>
          </div>
          <StatusBadge status={contract.status} />
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-5 text-sm space-y-2">
        <div className="flex justify-between">
          <span className="text-slate-500">Valor</span>
          <span className="font-semibold text-slate-900">{formatBRL(contract.valor)}</span>
        </div>
        {contract.objeto && <p className="text-slate-700 whitespace-pre-line pt-2 border-t border-slate-100">{contract.objeto}</p>}
      </div>

      {contract.status === "Assinado" ? (
        <div className="text-sm text-emerald-700 bg-emerald-50 border-l-4 border-emerald-300 px-4 py-3 rounded-r-md space-y-1">
          <div>Assinado por {contract.assinadoNome} ({contract.assinadoCpf})</div>
          <div>
            Em {contract.assinadoEm ? formatDate(contract.assinadoEm) : "—"} · IP {contract.assinadoIp}
          </div>
        </div>
      ) : (
        <CopyLinkBox path={`/contrato/${contract.publicToken}`} label="Link público do contrato" />
      )}
    </div>
  );
}
