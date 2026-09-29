"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Download } from "lucide-react";

type CompanyRow = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  subscriptionStatus: string;
  subscriptionPriceCents: number;
  lifetimeAccess: boolean;
  createdAt: string;
  cancelledAt: string | null;
  rowStatus: "ativo" | "cancelado" | "nao_pagou" | "bloqueado" | "inativo" | "vitalicio";
  rowStatusLabel: string;
  commissionCents: number;
};

type Summary = {
  ativo: number;
  cancelado: number;
  nao_pagou: number;
  bloqueado: number;
  inativo: number;
  vitalicio: number;
  totalComissaoCents: number;
};

type ReportData = {
  seller: { id: string; name: string; code: string; commissionPercent: number };
  month: string;
  companies: CompanyRow[];
  summary: Summary;
};

// Paleta de status (reservada: bom / atenção / crítico / neutro)
const STATUS_BAR_COLOR: Record<string, string> = {
  ativo: "#16a34a", // good
  nao_pagou: "#d97706", // warning
  cancelado: "#e11d48", // critical
  bloqueado: "#e11d48", // critical
  inativo: "#94a3b8", // muted/neutral
  vitalicio: "#2563eb", // info (one-off categorical)
};

const STATUS_BADGE_CLASS: Record<string, string> = {
  ativo: "bg-emerald-100 text-emerald-700",
  nao_pagou: "bg-amber-100 text-amber-700",
  cancelado: "bg-rose-100 text-rose-700",
  bloqueado: "bg-rose-100 text-rose-700",
  inativo: "bg-slate-100 text-slate-500",
  vitalicio: "bg-blue-100 text-blue-700",
};

function fmt(cents: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);
}

function monthLabel(month: string) {
  const [y, m] = month.split("-").map(Number);
  const d = new Date(y, m - 1, 1);
  return d.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
}

function shiftMonth(month: string, delta: number) {
  const [y, m] = month.split("-").map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export default function SellerReport({ sellerId }: { sellerId: string }) {
  const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  async function load(m: string) {
    setLoading(true);
    const res = await fetch(`/api/admin/sellers/${sellerId}/report?month=${m}`);
    const json = await res.json();
    setData(json);
    setLoading(false);
  }

  useEffect(() => {
    load(month);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month]);

  function exportCsv() {
    if (!data) return;
    const header = ["Cliente", "E-mail", "Telefone", "Status", "Valor mensal", "Comissão"];
    const lines = data.companies.map((c) => [
      c.name,
      c.email || "",
      c.phone || "",
      c.rowStatusLabel,
      (c.subscriptionPriceCents / 100).toFixed(2),
      (c.commissionCents / 100).toFixed(2),
    ]);
    const csv = [header, ...lines].map((row) => row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(";")).join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `relatorio-${data.seller.code}-${month}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (loading || !data) {
    return <div className="text-sm text-slate-400 py-8 text-center">Carregando relatório...</div>;
  }

  const { seller, summary, companies } = data;
  const statusBars: { key: keyof Summary; label: string }[] = [
    { key: "ativo", label: "Ativo (mensal)" },
    { key: "nao_pagou", label: "Não pagou" },
    { key: "cancelado", label: "Cancelado" },
    { key: "bloqueado", label: "Bloqueado" },
    { key: "vitalicio", label: "Vitalício" },
    { key: "inativo", label: "Inativo" },
  ];
  const maxBar = Math.max(1, ...statusBars.map((b) => summary[b.key] as number));

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between bg-white border border-slate-200 rounded-lg p-4">
        <div>
          <div className="text-sm font-medium text-slate-900">
            {seller.name} <span className="text-slate-400 font-mono text-xs">({seller.code})</span>
          </div>
          <div className="text-xs text-slate-400">Comissão: {seller.commissionPercent}% sobre clientes ativos no mês</div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setMonth((m) => shiftMonth(m, -1))} className="p-1.5 rounded-md hover:bg-slate-100">
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm font-medium text-slate-700 capitalize w-36 text-center">{monthLabel(month)}</span>
          <button onClick={() => setMonth((m) => shiftMonth(m, 1))} className="p-1.5 rounded-md hover:bg-slate-100">
            <ChevronRight size={16} />
          </button>
          <button
            onClick={exportCsv}
            className="ml-2 flex items-center gap-1 text-xs px-2.5 py-1.5 border border-slate-200 rounded-md hover:bg-slate-50"
          >
            <Download size={13} /> Exportar CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-white border border-slate-200 rounded-lg p-5 md:col-span-2">
          <div className="text-xs text-slate-400 mb-3">Clientes por situação neste mês</div>
          <div className="space-y-2">
            {statusBars.map((b) => {
              const value = summary[b.key] as number;
              return (
                <div key={b.key} className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 w-28 shrink-0">{b.label}</span>
                  <div className="flex-1 h-4 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${(value / maxBar) * 100}%`, backgroundColor: STATUS_BAR_COLOR[b.key] }}
                    />
                  </div>
                  <span className="text-xs font-medium text-slate-700 w-6 text-right">{value}</span>
                </div>
              );
            })}
          </div>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-5 flex flex-col justify-center">
          <div className="text-xs text-emerald-700">Comissão a pagar neste mês</div>
          <div className="text-2xl font-semibold text-emerald-800 mt-1">{fmt(summary.totalComissaoCents)}</div>
          <div className="text-[11px] text-emerald-600 mt-1">{summary.ativo} cliente(s) ativo(s) contando para a comissão</div>
        </div>
      </div>

      <p className="text-[11px] text-slate-400">
        O status considera a situação atual da assinatura de cada empresa. Um histórico mês a mês totalmente exato
        (com base em pagamentos confirmados) fica disponível assim que o Mercado Pago estiver integrado; até lá, este
        relatório reflete a situação de hoje aplicada ao mês selecionado.
      </p>

      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wide">
            <tr>
              <th className="text-left px-4 py-2 font-medium">Cliente</th>
              <th className="text-left px-4 py-2 font-medium">Contato</th>
              <th className="text-left px-4 py-2 font-medium">Status</th>
              <th className="text-left px-4 py-2 font-medium">Valor mensal</th>
              <th className="text-left px-4 py-2 font-medium">Comissão</th>
            </tr>
          </thead>
          <tbody>
            {companies.map((c) => (
              <tr key={c.id} className="border-b border-slate-100 last:border-0">
                <td className="px-4 py-3 text-sm font-medium text-slate-900">{c.name}</td>
                <td className="px-4 py-3 text-xs text-slate-500">
                  <div>{c.email || "—"}</div>
                  <div>{c.phone || "—"}</div>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_BADGE_CLASS[c.rowStatus]}`}>
                    {c.rowStatusLabel}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-slate-600">{fmt(c.subscriptionPriceCents)}</td>
                <td className="px-4 py-3 text-sm font-medium text-slate-800">
                  {c.commissionCents > 0 ? fmt(c.commissionCents) : "—"}
                </td>
              </tr>
            ))}
            {companies.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-slate-400">
                  Nenhum cliente indicado por este vendedor até este mês.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
