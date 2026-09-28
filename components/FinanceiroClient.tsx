"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { formatBRL, formatDate } from "@/lib/format";
import { computeDisplayStatus } from "@/lib/finance";
import StatusBadge from "@/components/StatusBadge";

type Entry = {
  id: string;
  tipo: string;
  descricao: string;
  categoria: string;
  valor: number;
  vencimento: string;
  status: string;
  dataPagamento: string | null;
  clientId: string | null;
};

type Client = { id: string; nome: string };

const CATEGORIAS_RECEITA = ["Projetos", "Consultoria", "Recorrente", "Vistoria", "Outros"];
const CATEGORIAS_DESPESA = ["Softwares", "Deslocamentos", "Materiais", "Impostos", "Fornecedores", "Outros"];

export default function FinanceiroClient({ initialEntries, clients }: { initialEntries: Entry[]; clients: Client[] }) {
  const router = useRouter();
  const [entries, setEntries] = useState(initialEntries);
  const [filter, setFilter] = useState<"todos" | "receita" | "despesa">("todos");
  const [showModal, setShowModal] = useState(false);

  const clientName = (id: string | null) => (id ? clients.find((c) => c.id === id)?.nome || "—" : "—");

  const totalReceitasPagas = entries.filter((e) => e.tipo === "receita" && e.status === "Pago").reduce((s, e) => s + e.valor, 0);
  const totalDespesasPagas = entries.filter((e) => e.tipo === "despesa" && e.status === "Pago").reduce((s, e) => s + e.valor, 0);
  const totalAReceber = entries
    .filter((e) => e.tipo === "receita" && computeDisplayStatus(e.status, e.vencimento) !== "Pago")
    .reduce((s, e) => s + e.valor, 0);
  const totalAtrasado = entries
    .filter((e) => computeDisplayStatus(e.status, e.vencimento) === "Atrasado")
    .reduce((s, e) => s + e.valor, 0);

  const filtered = entries.filter((e) => (filter === "todos" ? true : e.tipo === filter));

  async function markPaid(id: string) {
    await fetch(`/api/financial-entries/${id}/pay`, { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
    router.refresh();
    setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, status: "Pago" } : e)));
  }

  async function remove(id: string) {
    if (!confirm("Excluir este lançamento?")) return;
    await fetch(`/api/financial-entries/${id}`, { method: "DELETE" });
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }

  function addEntryLocal(entry: Entry) {
    setEntries((prev) => [entry, ...prev]);
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Financeiro</h1>
          <p className="text-slate-500 text-sm mt-1">Fluxo de caixa do escritório</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-md"
        >
          <Plus size={16} /> Novo lançamento
        </button>
      </div>

      <div className="flex flex-wrap divide-x divide-slate-200 bg-white rounded-lg border border-slate-200">
        <div className="flex-1 min-w-[160px] px-5 py-4">
          <div className="text-xs text-slate-500 mb-1">Receitas pagas</div>
          <div className="text-xl font-semibold text-emerald-600">{formatBRL(totalReceitasPagas)}</div>
        </div>
        <div className="flex-1 min-w-[160px] px-5 py-4">
          <div className="text-xs text-slate-500 mb-1">Despesas pagas</div>
          <div className="text-xl font-semibold text-rose-600">{formatBRL(totalDespesasPagas)}</div>
        </div>
        <div className="flex-1 min-w-[160px] px-5 py-4">
          <div className="text-xs text-slate-500 mb-1">Saldo realizado</div>
          <div className="text-xl font-semibold text-slate-900">{formatBRL(totalReceitasPagas - totalDespesasPagas)}</div>
        </div>
        <div className="flex-1 min-w-[160px] px-5 py-4">
          <div className="text-xs text-slate-500 mb-1">A receber</div>
          <div className="text-xl font-semibold text-slate-900">{formatBRL(totalAReceber)}</div>
        </div>
        <div className="flex-1 min-w-[160px] px-5 py-4">
          <div className="text-xs text-slate-500 mb-1">Em atraso</div>
          <div className="text-xl font-semibold text-rose-600">{formatBRL(totalAtrasado)}</div>
        </div>
      </div>

      <div className="flex gap-2">
        {(["todos", "receita", "despesa"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-xs px-3 py-1.5 rounded-full border ${
              filter === f ? "bg-blue-600 text-white border-blue-600" : "border-slate-200 text-slate-600"
            }`}
          >
            {f === "todos" ? "Todos" : f === "receita" ? "Receitas" : "Despesas"}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-lg border border-slate-200 divide-y divide-slate-100">
        {filtered.map((e) => {
          const displayStatus = computeDisplayStatus(e.status, e.vencimento);
          return (
            <div key={e.id} className="flex items-center gap-4 px-4 py-3 flex-wrap">
              <div className={`w-2 h-2 rounded-full shrink-0 ${e.tipo === "receita" ? "bg-emerald-500" : "bg-rose-500"}`} />
              <div className="flex-1 min-w-[160px]">
                <div className="text-sm font-medium text-slate-900 truncate">{e.descricao}</div>
                <div className="text-xs text-slate-400">
                  {e.categoria} · {clientName(e.clientId)}
                </div>
              </div>
              <div className="text-xs text-slate-400 hidden sm:block w-24">{formatDate(e.vencimento)}</div>
              <div
                className={`text-sm font-semibold w-28 text-right ${e.tipo === "receita" ? "text-emerald-600" : "text-rose-600"}`}
              >
                {e.tipo === "receita" ? "+" : "-"} {formatBRL(e.valor)}
              </div>
              <div className="w-24 flex justify-end">
                <StatusBadge status={displayStatus} />
              </div>
              <div className="flex gap-2 shrink-0">
                {displayStatus !== "Pago" && (
                  <button onClick={() => markPaid(e.id)} className="text-xs text-blue-600 hover:underline">
                    Marcar pago
                  </button>
                )}
                <button onClick={() => remove(e.id)} className="text-xs text-slate-400 hover:text-rose-500">
                  Excluir
                </button>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && <p className="text-sm text-slate-400 text-center py-8">Nenhum lançamento.</p>}
      </div>

      {showModal && (
        <NovoLancamentoModal
          clients={clients}
          onClose={() => setShowModal(false)}
          onSaved={(entry) => {
            addEntryLocal(entry);
            setShowModal(false);
          }}
        />
      )}
    </div>
  );
}

function NovoLancamentoModal({
  clients,
  onClose,
  onSaved,
}: {
  clients: Client[];
  onClose: () => void;
  onSaved: (entry: Entry) => void;
}) {
  const [tipo, setTipo] = useState<"receita" | "despesa">("receita");
  const [descricao, setDescricao] = useState("");
  const [categoria, setCategoria] = useState(CATEGORIAS_RECEITA[0]);
  const [valor, setValor] = useState("");
  const [vencimento, setVencimento] = useState("");
  const [clientId, setClientId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const inputClass =
    "w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500";
  const categorias = tipo === "receita" ? CATEGORIAS_RECEITA : CATEGORIAS_DESPESA;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!descricao.trim() || !valor || !vencimento) {
      setError("Preencha descrição, valor e vencimento.");
      return;
    }
    setSaving(true);
    const res = await fetch("/api/financial-entries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tipo, descricao, categoria, valor: parseFloat(valor), vencimento, clientId: clientId || null }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Erro ao salvar.");
      setSaving(false);
      return;
    }
    onSaved({
      id: data.id,
      tipo,
      descricao,
      categoria,
      valor: Math.round(parseFloat(valor) * 100),
      vencimento,
      status: "Pendente",
      dataPagamento: null,
      clientId: clientId || null,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="font-semibold text-slate-900">Novo lançamento</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="text-sm text-rose-700 bg-rose-50 border-l-4 border-rose-300 px-3 py-2 rounded-r-md">{error}</div>
          )}
          <div className="flex gap-2">
            {(["receita", "despesa"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => {
                  setTipo(t);
                  setCategoria(t === "receita" ? CATEGORIAS_RECEITA[0] : CATEGORIAS_DESPESA[0]);
                }}
                className={`flex-1 py-2 text-sm rounded-md border ${
                  tipo === t ? "bg-blue-600 text-white border-blue-600" : "border-slate-200 text-slate-600"
                }`}
              >
                {t === "receita" ? "Receita" : "Despesa"}
              </button>
            ))}
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Descrição</label>
            <input value={descricao} onChange={(e) => setDescricao(e.target.value)} className={inputClass} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Categoria</label>
              <select value={categoria} onChange={(e) => setCategoria(e.target.value)} className={inputClass}>
                {categorias.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Valor</label>
              <input type="number" value={valor} onChange={(e) => setValor(e.target.value)} className={inputClass} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Vencimento</label>
              <input type="date" value={vencimento} onChange={(e) => setVencimento(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Cliente (opcional)</label>
              <select value={clientId} onChange={(e) => setClientId(e.target.value)} className={inputClass}>
                <option value="">—</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-md">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? "Salvando..." : "Salvar lançamento"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
