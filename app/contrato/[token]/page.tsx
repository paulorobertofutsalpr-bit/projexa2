import { notFound } from "next/navigation";
import { db } from "@/db";
import { contracts, clients, companies } from "@/db/schema";
import { eq } from "drizzle-orm";
import { formatBRL } from "@/lib/format";
import ContractSignActions from "@/components/ContractSignActions";
import ContractPartiesHeader from "@/components/ContractPartiesHeader";

export const dynamic = "force-dynamic";

export default async function ContratoPublicoPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  const rows = await db
    .select({
      id: contracts.id,
      numero: contracts.numero,
      objeto: contracts.objeto,
      valor: contracts.valor,
      condicaoPagamento: contracts.condicaoPagamento,
      prazoExecucao: contracts.prazoExecucao,
      clausulas: contracts.clausulas,
      status: contracts.status,
      assinadoNome: contracts.assinadoNome,
      assinadoEm: contracts.assinadoEm,
      client: clients,
      company: companies,
    })
    .from(contracts)
    .innerJoin(clients, eq(contracts.clientId, clients.id))
    .innerJoin(companies, eq(contracts.companyId, companies.id))
    .where(eq(contracts.publicToken, token));

  const contract = rows[0];
  if (!contract) notFound();

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="text-white" style={{ backgroundColor: "#0B1D3A" }}>
        <div className="max-w-2xl mx-auto px-6 py-8">
          <div className="flex items-center gap-2 mb-4">
            {contract.company.logoData ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={contract.company.logoData} alt={contract.company.name} className="w-8 h-8 rounded object-contain" />
            ) : (
              <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center font-semibold text-sm">Pj</div>
            )}
            <span className="font-semibold">{contract.company.name}</span>
          </div>
          <h1 className="text-2xl font-semibold">Contrato {contract.numero}</h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-8 space-y-5">
        <ContractPartiesHeader company={contract.company} client={contract.client} />

        {contract.objeto && (
          <div className="bg-white border border-slate-200 rounded-lg p-5">
            <h2 className="text-xs uppercase tracking-wide text-slate-400 mb-2">Objeto</h2>
            <p className="text-sm text-slate-700 whitespace-pre-line">{contract.objeto}</p>
          </div>
        )}

        <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-500">Valor do contrato</span>
            <span className="font-semibold text-slate-900">{formatBRL(contract.valor)}</span>
          </div>
          {contract.condicaoPagamento && (
            <div className="flex justify-between">
              <span className="text-slate-500">Condição de pagamento</span>
              <span className="text-slate-800">{contract.condicaoPagamento}</span>
            </div>
          )}
          {contract.prazoExecucao && (
            <div className="flex justify-between">
              <span className="text-slate-500">Prazo de execução</span>
              <span className="text-slate-800">{contract.prazoExecucao}</span>
            </div>
          )}
        </div>

        {contract.clausulas && (
          <div className="bg-white border border-slate-200 rounded-lg p-5">
            <h2 className="text-xs uppercase tracking-wide text-slate-400 mb-2">Cláusulas</h2>
            <p className="text-sm text-slate-700 whitespace-pre-line">{contract.clausulas}</p>
          </div>
        )}

        <ContractSignActions
          token={token}
          status={contract.status}
          assinadoNome={contract.assinadoNome}
          assinadoEm={contract.assinadoEm ? contract.assinadoEm.toString() : null}
        />
      </div>
    </div>
  );
}
