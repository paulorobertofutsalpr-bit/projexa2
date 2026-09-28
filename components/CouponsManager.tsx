"use client";

import { useEffect, useState } from "react";

type Coupon = {
  id: string;
  code: string;
  kind: string;
  value: number;
  maxUses: number | null;
  usesCount: number;
  active: boolean;
  expiresAt: string | null;
  createdAt: string;
};

const KIND_LABELS: Record<string, string> = {
  percent: "Percentual de desconto",
  fixed: "Valor fixo de desconto",
  free: "Grátis (mensalidade zerada)",
  lifetime: "Vitalício (acesso permanente)",
};

export default function CouponsManager() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [code, setCode] = useState("");
  const [kind, setKind] = useState("percent");
  const [value, setValue] = useState("10");
  const [maxUses, setMaxUses] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/coupons");
    const data = await res.json();
    setCoupons(data.coupons || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    const res = await fetch("/api/admin/coupons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code,
        kind,
        value: kind === "percent" || kind === "fixed" ? Number(value) : 0,
        maxUses: maxUses ? Number(maxUses) : null,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Erro ao criar cupom.");
      setSaving(false);
      return;
    }
    setCode("");
    setValue("10");
    setMaxUses("");
    setSaving(false);
    load();
  }

  async function toggleActive(id: string, active: boolean) {
    await fetch(`/api/admin/coupons/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active }),
    });
    load();
  }

  async function remove(id: string) {
    await fetch(`/api/admin/coupons/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="space-y-4">
      <form onSubmit={create} className="bg-white border border-slate-200 rounded-lg p-5 grid gap-3 sm:grid-cols-5">
        <div className="sm:col-span-1">
          <label className="block text-xs font-medium text-slate-600 mb-1">Código</label>
          <input
            required
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="BEMVINDO50"
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md uppercase"
          />
        </div>
        <div className="sm:col-span-1">
          <label className="block text-xs font-medium text-slate-600 mb-1">Tipo</label>
          <select value={kind} onChange={(e) => setKind(e.target.value)} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md">
            {Object.entries(KIND_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </div>
        {(kind === "percent" || kind === "fixed") && (
          <div className="sm:col-span-1">
            <label className="block text-xs font-medium text-slate-600 mb-1">
              {kind === "percent" ? "Percentual (%)" : "Valor (R$)"}
            </label>
            <input
              type="number"
              step={kind === "percent" ? "1" : "0.01"}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md"
            />
          </div>
        )}
        <div className="sm:col-span-1">
          <label className="block text-xs font-medium text-slate-600 mb-1">Usos máximos (opcional)</label>
          <input
            type="number"
            value={maxUses}
            onChange={(e) => setMaxUses(e.target.value)}
            placeholder="Ilimitado"
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md"
          />
        </div>
        <div className="sm:col-span-1 flex items-end">
          <button
            type="submit"
            disabled={saving}
            className="w-full px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? "Criando..." : "Criar cupom"}
          </button>
        </div>
        {error && <p className="sm:col-span-5 text-sm text-rose-600">{error}</p>}
      </form>

      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wide">
            <tr>
              <th className="text-left px-4 py-2 font-medium">Código</th>
              <th className="text-left px-4 py-2 font-medium">Tipo</th>
              <th className="text-left px-4 py-2 font-medium">Usos</th>
              <th className="text-left px-4 py-2 font-medium">Status</th>
              <th className="text-right px-4 py-2 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {!loading &&
              coupons.map((c) => (
                <tr key={c.id} className="border-b border-slate-100 last:border-0">
                  <td className="px-4 py-3 text-sm font-mono text-slate-900">{c.code}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {KIND_LABELS[c.kind]}
                    {(c.kind === "percent" || c.kind === "fixed") && (
                      <span className="text-slate-400"> · {c.kind === "percent" ? `${c.value}%` : `R$ ${(c.value / 100).toFixed(2)}`}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {c.usesCount}
                    {c.maxUses ? ` / ${c.maxUses}` : ""}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${c.active ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-500"}`}
                    >
                      {c.active ? "Ativo" : "Desativado"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right space-x-3">
                    <button onClick={() => toggleActive(c.id, !c.active)} className="text-xs text-blue-600 hover:underline">
                      {c.active ? "Desativar" : "Ativar"}
                    </button>
                    <button onClick={() => remove(c.id)} className="text-xs text-rose-600 hover:underline">
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            {!loading && coupons.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-slate-400">
                  Nenhum cupom criado ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
