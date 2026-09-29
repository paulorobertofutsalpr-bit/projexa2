"use client";

import { useEffect, useState } from "react";

type Plan = {
  id: string;
  name: string;
  description: string | null;
  priceCentsMonthly: number;
  priceCentsAnnual: number;
  features: string;
  active: boolean;
  sortOrder: number;
  companyCount: number;
};

const emptyForm = {
  name: "",
  description: "",
  priceCentsMonthly: "0",
  priceCentsAnnual: "0",
  features: "",
};

function fmt(cents: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);
}

export default function PlansManager() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/plans");
    const data = await res.json();
    setPlans(data.plans || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function startCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
    setError(null);
  }

  function startEdit(p: Plan) {
    setEditingId(p.id);
    setForm({
      name: p.name,
      description: p.description || "",
      priceCentsMonthly: (p.priceCentsMonthly / 100).toFixed(2),
      priceCentsAnnual: (p.priceCentsAnnual / 100).toFixed(2),
      features: p.features,
    });
    setShowForm(true);
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.name.trim()) {
      setError("Informe o nome do plano.");
      return;
    }
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      priceCentsMonthly: Math.round(parseFloat(form.priceCentsMonthly || "0") * 100),
      priceCentsAnnual: Math.round(parseFloat(form.priceCentsAnnual || "0") * 100),
      features: form.features,
    };
    const res = await fetch(editingId ? `/api/admin/plans/${editingId}` : "/api/admin/plans", {
      method: editingId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      setError(data.error || "Erro ao salvar plano.");
      return;
    }
    setShowForm(false);
    setEditingId(null);
    load();
  }

  async function toggleActive(p: Plan) {
    await fetch(`/api/admin/plans/${p.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !p.active }),
    });
    load();
  }

  async function remove(p: Plan) {
    if (p.companyCount > 0) {
      if (!confirm(`${p.companyCount} empresa(s) usam este plano. Excluir mesmo assim?`)) return;
    } else if (!confirm("Excluir este plano?")) {
      return;
    }
    await fetch(`/api/admin/plans/${p.id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={startCreate}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-md"
        >
          + Novo plano
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-lg p-5 space-y-3">
          {error && <p className="text-sm text-rose-600">{error}</p>}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Nome do plano</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: Profissional"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Descrição curta</label>
            <input
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: Recursos completos para o escritório"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Preço mensal (R$)</label>
              <input
                type="number"
                step="0.01"
                value={form.priceCentsMonthly}
                onChange={(e) => setForm({ ...form, priceCentsMonthly: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Preço anual (R$)</label>
              <input
                type="number"
                step="0.01"
                value={form.priceCentsAnnual}
                onChange={(e) => setForm({ ...form, priceCentsAnnual: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Recursos (um por linha)</label>
            <textarea
              value={form.features}
              onChange={(e) => setForm({ ...form, features: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={"Clientes ilimitados\nFinanceiro completo\nExportação em PDF"}
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-md disabled:opacity-50"
            >
              {saving ? "Salvando..." : "Salvar plano"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-sm text-slate-500 px-4 py-2 rounded-md hover:bg-slate-50"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {!loading &&
          plans.map((p) => (
            <div key={p.id} className="bg-white border border-slate-200 rounded-lg p-5 flex flex-col">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-slate-900">{p.name}</h3>
                  {p.description && <p className="text-xs text-slate-500 mt-0.5">{p.description}</p>}
                </div>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    p.active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {p.active ? "Ativa" : "Inativa"}
                </span>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-semibold text-slate-900">
                  {fmt(p.priceCentsMonthly)}
                  <span className="text-sm font-normal text-slate-400">/mês</span>
                </div>
                <div className="text-xs text-slate-400">{fmt(p.priceCentsAnnual)}/ano</div>
              </div>
              {p.features && (
                <ul className="mt-3 space-y-1 text-xs text-slate-600 flex-1">
                  {p.features
                    .split("\n")
                    .filter(Boolean)
                    .map((f, i) => (
                      <li key={i}>• {f}</li>
                    ))}
                </ul>
              )}
              <div className="text-[11px] text-slate-400 mt-3">{p.companyCount} empresa(s) neste plano</div>
              <div className="flex gap-2 mt-3 pt-3 border-t border-slate-100">
                <button onClick={() => startEdit(p)} className="text-xs text-blue-600 hover:underline">
                  Editar
                </button>
                <button onClick={() => toggleActive(p)} className="text-xs text-slate-500 hover:underline">
                  {p.active ? "Desativar" : "Ativar"}
                </button>
                <button onClick={() => remove(p)} className="text-xs text-rose-600 hover:underline ml-auto">
                  Excluir
                </button>
              </div>
            </div>
          ))}
        {!loading && plans.length === 0 && (
          <p className="text-sm text-slate-400 col-span-full text-center py-8">Nenhum plano cadastrado ainda.</p>
        )}
      </div>
    </div>
  );
}
