"use client";

import { useEffect, useState } from "react";

type Seller = {
  id: string;
  name: string;
  email: string | null;
  code: string;
  commissionPercent: number;
  active: boolean;
  referredCount: number;
  referredMrrCents: number;
  commissionCents: number;
};

export default function SellersManager() {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [commission, setCommission] = useState("10");
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/sellers");
    const data = await res.json();
    setSellers(data.sellers || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    const res = await fetch("/api/admin/sellers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, code, commissionPercent: Number(commission) }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Erro ao criar vendedor.");
      setSaving(false);
      return;
    }
    setName("");
    setEmail("");
    setCode("");
    setCommission("10");
    setSaving(false);
    load();
  }

  async function toggleActive(id: string, active: boolean) {
    await fetch(`/api/admin/sellers/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active }),
    });
    load();
  }

  const fmt = (cents: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);

  return (
    <div className="space-y-4">
      <form onSubmit={create} className="bg-white border border-slate-200 rounded-lg p-5 grid gap-3 sm:grid-cols-5">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Nome</label>
          <input required value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">E-mail</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Código do vendedor</label>
          <input
            required
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="JOAO10"
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md uppercase"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Comissão (%)</label>
          <input
            type="number"
            min={0}
            max={100}
            value={commission}
            onChange={(e) => setCommission(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md"
          />
        </div>
        <div className="flex items-end">
          <button
            type="submit"
            disabled={saving}
            className="w-full px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? "Criando..." : "Criar vendedor"}
          </button>
        </div>
        {error && <p className="sm:col-span-5 text-sm text-rose-600">{error}</p>}
      </form>

      <p className="text-xs text-slate-400">
        No cadastro público (/cadastro), quem informar o código do vendedor no campo de cupom/indicação fica vinculado
        a ele. A comissão é calculada sobre a mensalidade das empresas ativas indicadas por cada vendedor.
      </p>

      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wide">
            <tr>
              <th className="text-left px-4 py-2 font-medium">Vendedor</th>
              <th className="text-left px-4 py-2 font-medium">Código</th>
              <th className="text-left px-4 py-2 font-medium">Comissão</th>
              <th className="text-left px-4 py-2 font-medium">Empresas indicadas</th>
              <th className="text-left px-4 py-2 font-medium">Receita atribuída</th>
              <th className="text-left px-4 py-2 font-medium">Comissão a pagar</th>
              <th className="text-right px-4 py-2 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {!loading &&
              sellers.map((s) => (
                <tr key={s.id} className="border-b border-slate-100 last:border-0">
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-slate-900">{s.name}</div>
                    <div className="text-xs text-slate-400">{s.email || "—"}</div>
                  </td>
                  <td className="px-4 py-3 text-sm font-mono text-slate-700">{s.code}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{s.commissionPercent}%</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{s.referredCount}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{fmt(s.referredMrrCents)}/mês</td>
                  <td className="px-4 py-3 text-sm font-medium text-emerald-700">{fmt(s.commissionCents)}/mês</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => toggleActive(s.id, !s.active)} className="text-xs text-blue-600 hover:underline">
                      {s.active ? "Desativar" : "Ativar"}
                    </button>
                  </td>
                </tr>
              ))}
            {!loading && sellers.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-sm text-slate-400">
                  Nenhum vendedor cadastrado ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
