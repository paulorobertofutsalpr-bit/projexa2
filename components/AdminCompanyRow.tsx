"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const STATUS_LABELS: Record<string, string> = {
  trial: "Sem assinatura ativa",
  pending: "Aguardando confirmação",
  active: "Ativa",
  overdue: "Pagamento pendente",
  blocked: "Bloqueada",
  cancelled: "Cancelada",
};

const STATUS_COLORS: Record<string, string> = {
  trial: "bg-slate-100 text-slate-600",
  pending: "bg-amber-100 text-amber-700",
  active: "bg-emerald-100 text-emerald-700",
  overdue: "bg-amber-100 text-amber-700",
  blocked: "bg-rose-100 text-rose-700",
  cancelled: "bg-slate-200 text-slate-500",
};

export default function AdminCompanyRow({
  company,
}: {
  company: {
    id: string;
    name: string;
    email: string | null;
    subscriptionStatus: string;
    subscriptionPriceCents: number;
    subscriptionOverdueSince: string | null;
    lifetimeAccess?: boolean;
    userCount: number;
    createdAt: string;
  };
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [status, setStatus] = useState(company.subscriptionStatus);
  const [price, setPrice] = useState((company.subscriptionPriceCents / 100).toFixed(2));
  const [lifetime, setLifetime] = useState(company.lifetimeAccess ?? false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setSaving(true);
    setError(null);
    const res = await fetch(`/api/admin/companies/${company.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subscriptionStatus: status,
        subscriptionPriceCents: Math.round(parseFloat(price) * 100),
        lifetimeAccess: lifetime,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Erro ao salvar.");
      setSaving(false);
      return;
    }
    setSaving(false);
    setEditing(false);
    router.refresh();
  }

  return (
    <tr className="border-b border-slate-100 last:border-0">
      <td className="px-4 py-3">
        <div className="text-sm font-medium text-slate-900 flex items-center gap-1.5">
          {company.name}
          {company.lifetimeAccess && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-violet-100 text-violet-700">Vitalício</span>
          )}
        </div>
        <div className="text-xs text-slate-400">{company.email || "—"}</div>
      </td>
      <td className="px-4 py-3 text-sm text-slate-600">{company.userCount}</td>
      <td className="px-4 py-3">
        {editing ? (
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="text-xs border border-slate-200 rounded-md px-2 py-1"
          >
            {Object.entries(STATUS_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        ) : (
          <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[company.subscriptionStatus] || "bg-slate-100 text-slate-600"}`}>
            {STATUS_LABELS[company.subscriptionStatus] || company.subscriptionStatus}
          </span>
        )}
      </td>
      <td className="px-4 py-3 text-sm text-slate-600">
        {editing ? (
          <input
            type="number"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-20 text-xs border border-slate-200 rounded-md px-2 py-1"
          />
        ) : (
          new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(company.subscriptionPriceCents / 100)
        )}
      </td>
      <td className="px-4 py-3 text-right">
        {editing ? (
          <div className="flex items-center justify-end gap-2">
            <label className="flex items-center gap-1 text-xs text-slate-500">
              <input type="checkbox" checked={lifetime} onChange={(e) => setLifetime(e.target.checked)} />
              Vitalício
            </label>
            {error && <span className="text-xs text-rose-600">{error}</span>}
            <button
              onClick={save}
              disabled={saving}
              className="text-xs text-blue-600 hover:underline disabled:opacity-50"
            >
              {saving ? "Salvando..." : "Salvar"}
            </button>
            <button onClick={() => setEditing(false)} className="text-xs text-slate-400 hover:underline">
              Cancelar
            </button>
          </div>
        ) : (
          <button onClick={() => setEditing(true)} className="text-xs text-blue-600 hover:underline">
            Editar
          </button>
        )}
      </td>
    </tr>
  );
}
