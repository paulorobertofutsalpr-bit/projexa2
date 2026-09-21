"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NovoClientePage() {
  const router = useRouter();
  const [form, setForm] = useState({
    tipo: "Pessoa Física",
    nome: "",
    documento: "",
    telefone: "",
    email: "",
    endereco: "",
    bairro: "",
    cep: "",
    cidade: "",
    estado: "",
    observacoes: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function update(k: string, v: string) {
    setForm((prev) => ({ ...prev, [k]: v }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await fetch("/api/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Erro ao salvar.");
      setLoading(false);
      return;
    }
    router.push("/clientes");
    router.refresh();
  }

  const inputClass =
    "w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <div className="max-w-2xl space-y-5">
      <div>
        <Link href="/clientes" className="text-sm text-blue-600 hover:underline">
          ← Voltar para clientes
        </Link>
        <h1 className="text-2xl font-semibold text-slate-900 mt-2">Novo cliente</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-lg p-6 space-y-4">
        {error && (
          <div className="text-sm text-rose-700 bg-rose-50 border-l-4 border-rose-300 px-3 py-2 rounded-r-md">
            {error}
          </div>
        )}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Tipo</label>
          <select value={form.tipo} onChange={(e) => update("tipo", e.target.value)} className={inputClass}>
            <option>Pessoa Física</option>
            <option>Pessoa Jurídica</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Nome / Razão social</label>
          <input
            required
            value={form.nome}
            onChange={(e) => update("nome", e.target.value)}
            className={inputClass}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">CPF/CNPJ</label>
            <input
              value={form.documento}
              onChange={(e) => update("documento", e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Telefone</label>
            <input
              value={form.telefone}
              onChange={(e) => update("telefone", e.target.value)}
              className={inputClass}
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">E-mail</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Endereço</label>
          <input
            value={form.endereco}
            onChange={(e) => update("endereco", e.target.value)}
            className={inputClass}
          />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Bairro</label>
            <input
              value={form.bairro}
              onChange={(e) => update("bairro", e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">CEP</label>
            <input
              value={form.cep}
              onChange={(e) => update("cep", e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Estado</label>
            <input
              value={form.estado}
              maxLength={2}
              onChange={(e) => update("estado", e.target.value)}
              className={inputClass}
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Cidade</label>
          <input
            value={form.cidade}
            onChange={(e) => update("cidade", e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Observações</label>
          <textarea
            value={form.observacoes}
            onChange={(e) => update("observacoes", e.target.value)}
            className={inputClass}
            rows={3}
          />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Link href="/clientes" className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-md">
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Salvando..." : "Salvar cliente"}
          </button>
        </div>
      </form>
    </div>
  );
}
