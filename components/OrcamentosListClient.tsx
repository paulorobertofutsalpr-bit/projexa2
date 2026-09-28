"use client";

import { useState } from "react";
import Link from "next/link";
import { formatBRL, formatDate } from "@/lib/format";
import StatusBadge from "@/components/StatusBadge";

type Budget = {
  id: string;
  numero: string;
  status: string;
  total: number;
  createdAt: Date | string;
  clientName: string;
};

const STATUSES = ["Todos", "Rascunho", "Enviado", "Aprovado", "Recusado"];

export default function OrcamentosListClient({ budgets }: { budgets: Budget[] }) {
  const [filter, setFilter] = useState("Todos");
  const filtered = filter === "Todos" ? budgets : budgets.filter((b) => b.status === filter);

  return (
    <div className="space-y-3">
      <div className="flex gap-2 flex-wrap">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`text-xs px-3 py-1.5 rounded-full border ${
              filter === s ? "bg-blue-600 text-white border-blue-600" : "border-slate-200 text-slate-600"
            }`}
          >
            {s}
          </button>
        ))}
      </div>
      <div className="grid gap-3">
        {filtered.map((b) => (
          <Link
            key={b.id}
            href={`/orcamentos/${b.id}`}
            className="bg-white border border-slate-200 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 hover:border-blue-300"
          >
            <div className="sm:w-32 shrink-0">
              <div className="text-xs text-slate-400" style={{ fontFamily: "ui-monospace, monospace" }}>
                {b.numero}
              </div>
              <div className="text-xs text-slate-400 mt-0.5">{formatDate(b.createdAt)}</div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-slate-900">{b.clientName}</div>
            </div>
            <div className="text-right sm:w-32 shrink-0 font-semibold text-slate-900">{formatBRL(b.total)}</div>
            <div className="sm:w-32 shrink-0 flex justify-end">
              <StatusBadge status={b.status} />
            </div>
          </Link>
        ))}
        {filtered.length === 0 && <p className="text-sm text-slate-400 text-center py-8">Nenhum orçamento com esse status.</p>}
      </div>
    </div>
  );
}
