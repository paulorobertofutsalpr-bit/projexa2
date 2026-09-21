"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Copy, Check, Printer } from "lucide-react";

export default function OrcamentoActions({
  budgetId,
  status,
  publicToken,
}: {
  budgetId: string;
  status: string;
  publicToken: string;
}) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [convertError, setConvertError] = useState<string | null>(null);
  const [contractLoading, setContractLoading] = useState(false);
  const [contractError, setContractError] = useState<string | null>(null);

  const publicUrl = typeof window !== "undefined" ? `${window.location.origin}/proposta/${publicToken}` : "";

  async function updateStatus(newStatus: string) {
    setLoading(true);
    await fetch(`/api/budgets/${budgetId}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    router.refresh();
    setLoading(false);
  }

  async function convertToProject() {
    setLoading(true);
    setConvertError(null);
    const res = await fetch(`/api/budgets/${budgetId}/converter-projeto`, { method: "POST" });
    const data = await res.json();
    if (!res.ok) {
      setConvertError(data.error || "Erro ao converter.");
      setLoading(false);
      return;
    }
    router.push(`/projetos/${data.id}`);
  }

  async function generateContract() {
    setContractLoading(true);
    setContractError(null);
    const res = await fetch(`/api/budgets/${budgetId}/gerar-contrato`, { method: "POST" });
    const data = await res.json();
    if (!res.ok) {
      setContractError(data.error || "Erro ao gerar contrato.");
      setContractLoading(false);
      return;
    }
    router.push(`/contratos/${data.id}`);
  }

  function copyLink() {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-slate-700">Ações</h2>
        <a
          href={`/orcamentos/${budgetId}/imprimir`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-blue-600 hover:underline flex items-center gap-1"
        >
          <Printer size={14} /> Visualizar / gerar PDF
        </a>
      </div>

      {status === "Rascunho" && (
        <button
          onClick={() => updateStatus("Enviado")}
          disabled={loading}
          className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          Marcar como enviado
        </button>
      )}

      {(status === "Enviado" || status === "Aprovado" || status === "Recusado") && (
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Link público da proposta</label>
          <div className="flex gap-2">
            <input readOnly value={publicUrl} className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-md bg-slate-50" />
            <button onClick={copyLink} className="px-3 py-2 text-sm border border-slate-200 rounded-md hover:bg-slate-50 flex items-center gap-1">
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? "Copiado" : "Copiar"}
            </button>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Envie esse link para o cliente aprovar ou recusar a proposta, sem precisar criar conta.
          </p>
        </div>
      )}

      {status === "Enviado" && (
        <div className="flex gap-2 pt-2 border-t border-slate-100">
          <button
            onClick={() => updateStatus("Aprovado")}
            disabled={loading}
            className="text-xs text-emerald-700 hover:underline"
          >
            Marcar como aprovado manualmente
          </button>
          <span className="text-slate-300">·</span>
          <button
            onClick={() => updateStatus("Recusado")}
            disabled={loading}
            className="text-xs text-rose-700 hover:underline"
          >
            Marcar como recusado
          </button>
        </div>
      )}
      {status === "Aprovado" && (
        <div className="pt-2 border-t border-slate-100 space-y-2">
          {convertError && (
            <div className="text-sm text-rose-700 bg-rose-50 border-l-4 border-rose-300 px-3 py-2 rounded-r-md">
              {convertError}
            </div>
          )}
          {contractError && (
            <div className="text-sm text-rose-700 bg-rose-50 border-l-4 border-rose-300 px-3 py-2 rounded-r-md">
              {contractError}
            </div>
          )}
          <div className="flex gap-2">
            <button
              onClick={convertToProject}
              disabled={loading}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              Converter em projeto
            </button>
            <button
              onClick={generateContract}
              disabled={contractLoading}
              className="px-4 py-2 text-sm border border-slate-200 text-slate-700 rounded-md hover:bg-slate-50 disabled:opacity-50"
            >
              {contractLoading ? "Gerando..." : "Gerar contrato"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
