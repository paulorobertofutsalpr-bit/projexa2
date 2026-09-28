"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

type ClientForm = {
  tipo: string;
  nome: string;
  documento: string;
  telefone: string;
  email: string;
  cidade: string;
  estado: string;
  endereco: string;
  bairro: string;
  cep: string;
  observacoes: string;
};

const EMPTY: ClientForm = {
  tipo: "Pessoa Física",
  nome: "",
  documento: "",
  telefone: "",
  email: "",
  cidade: "",
  estado: "",
  endereco: "",
  bairro: "",
  cep: "",
  observacoes: "",
};

export default function EditarClientePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [form, setForm] = useState<ClientForm>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/clients/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.client) {
          setForm({
            tipo: data.client.tipo || "Pessoa Física",
            nome: data.client.nome || "",
            documento: data.client.documento || "",
            telefone: data.client.telefone || "",
            email: data.client.email || "",
            cidade: data.client.cidade || "",
            estado: data.client.estado || "",
            endereco: data.client.endereco || "",
            bairro: data.client.bairro || "",
            cep: data.client.cep || "",
            observacoes: data.client.observacoes || "",
          });
        }
        setLoading(false);
      });
  }, [id]);

  function update(k: keyof ClientForm, v: string) {
    setForm((prev) => ({ ...prev, [k]: v }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    const res = await fetch(`/api/clients/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Erro ao salvar.");
      setSaving(false);
      return;
    }
    router.push(`/clientes/${id}`);
    router.refresh();
  }

  const inputClass =
    "w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500";

  if (loading) return <p className="text-sm text-slate-400">Carregando...</p>;

  return (
    <div className="max-w-2xl space-y-5">
      <div>
        <Link href={`/clientes/${id}`} className="text-sm text-blue-600 hover:underline">
          ← Voltar para o cliente
        </Link>
        <h1 className="text-2xl font-semibold text-slate-900 mt-2">Editar cliente</h1>
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
          <input required value={form.nome} onChange={(e) => update("nome", e.target.value)} className={inputClass} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">CPF/CNPJ</label>
            <input value={form.documento} onChange={(e) => update("documento", e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Telefone</label>
            <input value={form.telefone} onChange={(e) => update("telefone", e.target.value)} className={inputClass} />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">E-mail</label>
          <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Endereço</label>
          <input value={form.endereco} onChange={(e) => update("endereco", e.target.value)} className={inputClass} />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Bairro</label>
            <input value={form.bairro} onChange={(e) => update("bairro", e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">CEP</label>
            <input value={form.cep} onChange={(e) => update("cep", e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Estado</label>
            <input maxLength={2} value={form.estado} onChange={(e) => update("estado", e.target.value)} className={inputClass} />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Cidade</label>
          <input value={form.cidade} onChange={(e) => update("cidade", e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Observações</label>
          <textarea value={form.observacoes} onChange={(e) => update("observacoes", e.target.value)} className={inputClass} rows={3} />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Link href={`/clientes/${id}`} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-md">
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? "Salvando..." : "Salvar alterações"}
          </button>
        </div>
      </form>
    </div>
  );
}
