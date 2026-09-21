import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db";
import { budgets, budgetItems, clients, companies } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { formatBRL, formatDate } from "@/lib/format";
import PrintButton from "@/components/PrintButton";

export const dynamic = "force-dynamic";

export default async function ImprimirOrcamentoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const rows = await db
    .select({
      numero: budgets.numero,
      objeto: budgets.objeto,
      validadeDias: budgets.validadeDias,
      condicaoPagamento: budgets.condicaoPagamento,
      formaPagamento: budgets.formaPagamento,
      prazoExecucao: budgets.prazoExecucao,
      previsaoInicio: budgets.previsaoInicio,
      localExecucao: budgets.localExecucao,
      responsavelTecnico: budgets.responsavelTecnico,
      garantia: budgets.garantia,
      escopoIncluso: budgets.escopoIncluso,
      escopoNaoIncluso: budgets.escopoNaoIncluso,
      observacoesComerciais: budgets.observacoesComerciais,
      total: budgets.total,
      createdAt: budgets.createdAt,
      client: clients,
      company: companies,
    })
    .from(budgets)
    .innerJoin(clients, eq(budgets.clientId, clients.id))
    .innerJoin(companies, eq(budgets.companyId, companies.id))
    .where(and(eq(budgets.id, id), eq(budgets.companyId, user.companyId)));

  const budget = rows[0];
  if (!budget) notFound();

  const items = await db.select().from(budgetItems).where(eq(budgetItems.budgetId, id));
  const dataValidade = new Date(budget.createdAt);
  dataValidade.setDate(dataValidade.getDate() + budget.validadeDias);

  const escopoInclusoList = (budget.escopoIncluso || "").split("\n").map((l) => l.trim()).filter(Boolean);
  const escopoNaoInclusoList = (budget.escopoNaoIncluso || "").split("\n").map((l) => l.trim()).filter(Boolean);

  return (
    <div className="min-h-screen bg-slate-200 py-8 print:bg-white print:py-0">
      <div className="max-w-[210mm] mx-auto px-4 print:px-0">
        <div className="flex justify-end mb-4 print:hidden">
          <PrintButton />
        </div>

        <div className="bg-white shadow-lg print:shadow-none" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
          {/* Faixa superior */}
          <div className="h-3" style={{ backgroundColor: "#0B1D3A" }} />

          <div className="px-10 py-8">
            {/* Cabeçalho */}
            <div className="flex items-start justify-between pb-6 border-b-2" style={{ borderColor: "#0B1D3A" }}>
              <div className="flex items-center gap-3">
                {budget.company.logoData ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={budget.company.logoData} alt={budget.company.name} className="w-14 h-14 object-contain" />
                ) : (
                  <div
                    className="w-14 h-14 rounded flex items-center justify-center text-white font-semibold text-lg"
                    style={{ backgroundColor: "#0B1D3A" }}
                  >
                    {budget.company.name?.charAt(0) || "P"}
                  </div>
                )}
                <div>
                  <div className="font-semibold text-lg" style={{ color: "#0B1D3A" }}>
                    {budget.company.name}
                  </div>
                  {budget.company.document && <div className="text-xs text-slate-500">{budget.company.document}</div>}
                  {(budget.company.phone || budget.company.email) && (
                    <div className="text-xs text-slate-500">
                      {[budget.company.phone, budget.company.email].filter(Boolean).join(" · ")}
                    </div>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] uppercase tracking-widest text-slate-400">Proposta comercial</div>
                <div className="text-2xl font-bold" style={{ color: "#0B1D3A" }}>
                  {budget.numero}
                </div>
                <div className="text-xs text-slate-500 mt-1">Emitida em {formatDate(budget.createdAt)}</div>
                <div className="text-xs text-slate-500">Válida até {formatDate(dataValidade)}</div>
              </div>
            </div>

            {/* Partes */}
            <div className="grid grid-cols-2 gap-8 py-6 border-b border-slate-200">
              <div>
                <div className="text-[10px] uppercase tracking-widest text-slate-400 mb-1.5">Contratado</div>
                <div className="text-sm font-semibold text-slate-900">{budget.company.name}</div>
                {budget.company.address && (
                  <div className="text-xs text-slate-600 mt-0.5">
                    {budget.company.address}
                    {budget.company.city ? ` — ${budget.company.city}/${budget.company.state ?? ""}` : ""}
                  </div>
                )}
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-widest text-slate-400 mb-1.5">Contratante</div>
                <div className="text-sm font-semibold text-slate-900">{budget.client.nome}</div>
                {budget.client.documento && <div className="text-xs text-slate-600 mt-0.5">{budget.client.documento}</div>}
                {(budget.client.endereco || budget.client.cidade) && (
                  <div className="text-xs text-slate-600">
                    {[budget.client.endereco, budget.client.cidade].filter(Boolean).join(" — ")}
                  </div>
                )}
              </div>
            </div>

            {/* Objeto */}
            {budget.objeto && (
              <div className="py-6 border-b border-slate-200">
                <div className="text-[10px] uppercase tracking-widest text-slate-400 mb-1.5">Objeto</div>
                <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-line">{budget.objeto}</p>
              </div>
            )}

            {/* Tabela de itens */}
            <div className="py-6 border-b border-slate-200">
              <div className="text-[10px] uppercase tracking-widest text-slate-400 mb-2">Escopo e investimento</div>
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr style={{ backgroundColor: "#0B1D3A" }}>
                    <th className="py-2 px-3 text-left text-white font-medium text-xs">Serviço</th>
                    <th className="py-2 px-3 text-right text-white font-medium text-xs">Qtd.</th>
                    <th className="py-2 px-3 text-right text-white font-medium text-xs">Valor unit.</th>
                    <th className="py-2 px-3 text-right text-white font-medium text-xs">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((i, idx) => (
                    <tr key={i.id} style={{ backgroundColor: idx % 2 === 0 ? "#F8FAFC" : "white" }}>
                      <td className="py-2.5 px-3 align-top">
                        <div className="text-slate-800">{i.nome}</div>
                        {i.observacoes && <div className="text-xs text-slate-400 mt-0.5">{i.observacoes}</div>}
                      </td>
                      <td className="py-2.5 px-3 text-right align-top text-slate-600">
                        {i.quantidade} {i.unidade}
                      </td>
                      <td className="py-2.5 px-3 text-right align-top text-slate-600">{formatBRL(i.valorUnitario)}</td>
                      <td className="py-2.5 px-3 text-right align-top font-medium text-slate-900">{formatBRL(i.valor)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex justify-end mt-4">
                <div className="w-64 rounded-md px-4 py-3" style={{ backgroundColor: "#0B1D3A" }}>
                  <div className="text-[10px] uppercase tracking-widest text-blue-200">Valor total da proposta</div>
                  <div className="text-2xl font-bold text-white">{formatBRL(budget.total)}</div>
                </div>
              </div>
            </div>

            {/* Condições */}
            <div className="grid grid-cols-2 gap-x-8 gap-y-3 py-6 border-b border-slate-200 text-sm">
              {budget.previsaoInicio && (
                <div>
                  <span className="text-slate-400">Previsão de início: </span>
                  <span className="text-slate-800">{budget.previsaoInicio}</span>
                </div>
              )}
              {budget.prazoExecucao && (
                <div>
                  <span className="text-slate-400">Prazo de execução: </span>
                  <span className="text-slate-800">{budget.prazoExecucao}</span>
                </div>
              )}
              {budget.localExecucao && (
                <div>
                  <span className="text-slate-400">Local de execução: </span>
                  <span className="text-slate-800">{budget.localExecucao}</span>
                </div>
              )}
              {budget.condicaoPagamento && (
                <div>
                  <span className="text-slate-400">Condição de pagamento: </span>
                  <span className="text-slate-800">{budget.condicaoPagamento}</span>
                </div>
              )}
              {budget.formaPagamento && (
                <div>
                  <span className="text-slate-400">Forma de pagamento: </span>
                  <span className="text-slate-800">{budget.formaPagamento}</span>
                </div>
              )}
              {budget.responsavelTecnico && (
                <div>
                  <span className="text-slate-400">Responsável técnico: </span>
                  <span className="text-slate-800">{budget.responsavelTecnico}</span>
                </div>
              )}
              {budget.garantia && (
                <div>
                  <span className="text-slate-400">Garantia: </span>
                  <span className="text-slate-800">{budget.garantia}</span>
                </div>
              )}
            </div>

            {/* Escopo incluso/nao incluso */}
            {(escopoInclusoList.length > 0 || escopoNaoInclusoList.length > 0) && (
              <div className="grid grid-cols-2 gap-8 py-6 border-b border-slate-200">
                {escopoInclusoList.length > 0 && (
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-slate-400 mb-2">Está incluso</div>
                    <ul className="space-y-1">
                      {escopoInclusoList.map((l, i) => (
                        <li key={i} className="text-xs text-slate-700 flex gap-1.5">
                          <span>✓</span> {l}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {escopoNaoInclusoList.length > 0 && (
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-slate-400 mb-2">Não está incluso</div>
                    <ul className="space-y-1">
                      {escopoNaoInclusoList.map((l, i) => (
                        <li key={i} className="text-xs text-slate-500 flex gap-1.5">
                          <span>–</span> {l}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {budget.observacoesComerciais && (
              <div className="py-6 border-b border-slate-200">
                <div className="text-[10px] uppercase tracking-widest text-slate-400 mb-1.5">Observações</div>
                <p className="text-xs text-slate-600 whitespace-pre-line">{budget.observacoesComerciais}</p>
              </div>
            )}

            {/* Assinaturas */}
            <div className="grid grid-cols-2 gap-12 pt-10 pb-4">
              <div className="text-center">
                <div className="border-t border-slate-400 pt-2 text-xs text-slate-600">
                  {budget.company.name}
                  <div className="text-slate-400">Contratado</div>
                </div>
              </div>
              <div className="text-center">
                <div className="border-t border-slate-400 pt-2 text-xs text-slate-600">
                  {budget.client.nome}
                  <div className="text-slate-400">Contratante</div>
                </div>
              </div>
            </div>
          </div>

          {/* Rodapé */}
          <div className="px-10 py-4 text-center text-[10px] text-slate-400 border-t border-slate-100">
            {budget.company.name}
            {budget.company.website ? ` · ${budget.company.website}` : ""}
            {" · Documento gerado eletronicamente pelo Projexa"}
          </div>
        </div>
      </div>
    </div>
  );
}
