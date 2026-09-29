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

type Plan = { id: string; name: string };

export default function AdminCompanyRow({
  company,
  plans,
}: {
  company: {
    id: string;
    name: string;
    email: string | null;
    subscriptionStatus: string;
    subscriptionPriceCents: number;
    subscriptionOverdueSince: string | null;
    lifetimeAccess?: boolean;
    planId?: string | null;
    isTest?: boolean;
    userCount: number;
    createdAt: string;
  };
  plans: Plan[];
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [status, setStatus] = useState(company.subscriptionStatus);
  const [price, setPrice] = useState((company.subscriptionPriceCents / 100).toFixed(2));
  const [lifetime, setLifetime] = useState(company.lifetimeAccess ?? false);
  const [planId, setPlanId] = useState(company.planId ?? "");
  const [isTest, setIsTest] = useState(company.isTest ?? false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function updateCompany(update: Record<string, unknown>) {
    setSaving(true);
    setError(null);
    const res = await fetch(`/api/admin/companies/${company.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(update),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      setError(data.error || "Erro ao salvar.");
      return false;
    }
    router.refresh();
    return true;
  }

  async function save() {
    const ok = await updateCompany({
      subscriptionStatus: status,
      subscriptionPriceCents: Math.round(parseFloat(price) * 100),
      lifetimeAccess: lifetime,
      planId: planId || null,
      isTest,
    });
    if (ok) setEditing(false);
  }

  async function quickToggleAccess() {
    if (company.subscriptionStatus === "blocked") {
      await updateCompany({ subscriptionStatus: "active" });
    } else {
      await updateCompany({ subscriptionStatus: "blocked" });
    }
  }

  const planName = plans.find((p) => p.id === company.planId)?.name;

  return (
    <tr className="border-b border-slate-100 last:border-0">
      <td className="px-4 py-3">
        <div className="text-sm font-medium text-slate-900 flex items-center gap-1.5">
          {company.name}
          {company.lifetimeAccess && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-violet-100 text-violet-700">Vitalício</span>
          )}
          {company.isTest && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-200 text-slate-600">Teste</span>
          )}
        </div>
        <div className="text-xs text-slate-400">{company.email || "—"}</div>
      </td>
      <td className="px-4 py-3 text-sm text-slate-600">{company.userCount}</td>
      <td className="px-4 py-3">
        {editing ? (
          <select
            value={planId}
            onChange={(e) => setPlanId(e.target.value)}
            className="text-xs border border-slate-200 rounded-md px-2 py-1"
          >
            <option value="">Sem plano</option>
            {plans.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        ) : (
          <span className="text-sm text-slate-600">{planName || "—"}</span>
        )}
      </td>
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
            <label className="flex items-center gap-1 text-xs text-slate-500">
              <input type="checkbox" checked={isTest} onChange={(e) => setIsTest(e.target.checked)} />
              Teste
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
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={quickToggleAccess}
              disabled={saving}
              className={`text-xs px-2 py-1 rounded-md font-medium disabled:opacity-50 ${
                company.subscriptionStatus === "blocked"
                  ? "bg-emerald-600 text-white hover:bg-emerald-700"
                  : "bg-rose-600 text-white hover:bg-rose-700"
              }`}
            >
              {company.subscriptionStatus === "blocked" ? "Conceder acesso" : "Bloquear"}
            </button>
            <button onClick={() => setEditing(true)} className="text-xs text-blue-600 hover:underline">
              Editar
            </button>
          </div>
        )}
      </td>
    </tr>
  );
}
