import { notFound } from "next/navigation";
import { db } from "@/db";
import { sellers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { buildSellerReport } from "@/lib/sellerReport";
import PrintButton from "@/components/PrintButton";

export const dynamic = "force-dynamic";

const STATUS_COLOR: Record<string, string> = {
  ativo: "#16a34a",
  nao_pagou: "#d97706",
  cancelado: "#e11d48",
  bloqueado: "#e11d48",
  inativo: "#94a3b8",
  vitalicio: "#2563eb",
};

function fmt(cents: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);
}
function fmtDate(d: Date) {
  return d.toLocaleDateString("pt-BR");
}

export default async function ImprimirRelatorioVendedorPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ month?: string }>;
}) {
  const { token } = await params;
  const { month: monthParam } = await searchParams;
  const month = monthParam || new Date().toISOString().slice(0, 7);

  const rows = await db.select().from(sellers).where(eq(sellers.portalToken, token));
  const seller = rows[0];
  if (!seller) notFound();

  const report = await buildSellerReport(seller, month);
  const monthLabel = new Date(report.periodStart).toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

  return (
    <div className="min-h-screen bg-slate-200 py-8 print:bg-white print:py-0">
      <div className="max-w-[210mm] mx-auto px-4 print:px-0">
        <div className="flex justify-end mb-4 print:hidden">
          <PrintButton />
        </div>

        <div className="bg-white shadow-lg print:shadow-none p-10" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
          <div className="flex items-center justify-between border-b-2 pb-4 mb-6" style={{ borderColor: "#0B1D3A" }}>
            <div>
              <h1 className="text-2xl font-bold" style={{ color: "#0B1D3A" }}>
                Relatório de comissão
              </h1>
              <p className="text-sm text-slate-500 capitalize">{monthLabel}</p>
            </div>
            <div className="text-right text-sm text-slate-500">
              <div className="font-semibold text-slate-800">{seller.name}</div>
              <div className="font-mono">{seller.code}</div>
              <div>{seller.commissionPercent}% de comissão</div>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-md px-4 py-2 text-sm text-slate-700 mb-6">
            Período de apuração: <strong>{fmtDate(report.periodStart)} a {fmtDate(report.periodEnd)}</strong>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6 text-sm">
            <div className="border border-slate-200 rounded-md p-3">
              <div className="text-xs text-slate-400">Clientes ativos</div>
              <div className="text-xl font-semibold">{report.summary.ativo}</div>
            </div>
            <div className="border border-slate-200 rounded-md p-3">
              <div className="text-xs text-slate-400">Cancelados / atrasados</div>
              <div className="text-xl font-semibold">{report.summary.cancelado + report.summary.nao_pagou}</div>
            </div>
            <div className="border border-slate-200 rounded-md p-3" style={{ borderColor: "#16a34a" }}>
              <div className="text-xs text-slate-400">Comissão a pagar</div>
              <div className="text-xl font-semibold text-emerald-700">{fmt(report.summary.totalComissaoCents)}</div>
            </div>
          </div>

          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-300 text-left text-xs uppercase text-slate-500">
                <th className="py-2 pr-2">Cliente</th>
                <th className="py-2 pr-2">Contato</th>
                <th className="py-2 pr-2">Status</th>
                <th className="py-2 pr-2 text-right">Valor mensal</th>
                <th className="py-2 text-right">Comissão</th>
              </tr>
            </thead>
            <tbody>
              {report.companies.map((c) => (
                <tr key={c.id} className="border-b border-slate-100">
                  <td className="py-2 pr-2 font-medium">{c.name}</td>
                  <td className="py-2 pr-2 text-xs text-slate-500">
                    {c.email || "—"}
                    <br />
                    {c.phone || "—"}
                  </td>
                  <td className="py-2 pr-2">
                    <span
                      className="inline-block w-2 h-2 rounded-full mr-1.5"
                      style={{ backgroundColor: STATUS_COLOR[c.rowStatus] }}
                    />
                    {c.rowStatusLabel}
                  </td>
                  <td className="py-2 pr-2 text-right">{fmt(c.subscriptionPriceCents)}</td>
                  <td className="py-2 text-right font-medium">
                    {c.commissionCents > 0 ? fmt(c.commissionCents) : "—"}
                  </td>
                </tr>
              ))}
              {report.companies.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-400">
                    Nenhum cliente indicado até este mês.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <p className="text-[10px] text-slate-400 mt-8">
            Gerado por Projexa em {fmtDate(new Date())}. O status reflete a situação da assinatura no momento da
            emissão deste relatório.
          </p>
        </div>
      </div>
    </div>
  );
}
