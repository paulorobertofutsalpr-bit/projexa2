"use client";

import { useState } from "react";

export default function PropostaActions({ token, status }: { token: string; status: string }) {
  const [currentStatus, setCurrentStatus] = useState(status);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function respond(action: "aprovar" | "recusar") {
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/public/proposta/${token}/${action}`, { method: "POST" });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Erro ao processar.");
      setLoading(false);
      return;
    }
    setCurrentStatus(action === "aprovar" ? "Aprovado" : "Recusado");
    setLoading(false);
  }

  if (currentStatus === "Aprovado") {
    return (
      <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg p-5 text-center">
        Proposta aprovada com sucesso.
      </div>
    );
  }

  if (currentStatus === "Recusado") {
    return (
      <div className="bg-slate-100 border border-slate-200 text-slate-600 rounded-lg p-5 text-center">
        Esta proposta foi recusada.
      </div>
    );
  }

  if (currentStatus !== "Enviado") {
    return (
      <div className="bg-slate-100 border border-slate-200 text-slate-600 rounded-lg p-5 text-center">
        Esta proposta ainda não está disponível para aprovação.
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-3">
      {error && (
        <div className="text-sm text-rose-700 bg-rose-50 border-l-4 border-rose-300 px-3 py-2 rounded-r-md">
          {error}
        </div>
      )}
      <div className="flex gap-3">
        <button
          onClick={() => respond("aprovar")}
          disabled={loading}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2.5 rounded-md disabled:opacity-50"
        >
          Aprovar proposta
        </button>
        <button
          onClick={() => respond("recusar")}
          disabled={loading}
          className="flex-1 border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-medium py-2.5 rounded-md disabled:opacity-50"
        >
          Recusar proposta
        </button>
      </div>
    </div>
  );
}
