"use client";

import { useState } from "react";

export default function ContractSignActions({
  token,
  status,
  assinadoNome,
  assinadoEm,
}: {
  token: string;
  status: string;
  assinadoNome: string | null;
  assinadoEm: string | null;
}) {
  const [currentStatus, setCurrentStatus] = useState(status);
  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [signedName, setSignedName] = useState(assinadoNome);

  async function handleSign(e: React.FormEvent) {
    e.preventDefault();
    if (!nome.trim() || !cpf.trim()) {
      setError("Preencha nome completo e CPF/CNPJ.");
      return;
    }
    setError(null);
    setLoading(true);
    const res = await fetch(`/api/public/contrato/${token}/assinar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, cpf }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Erro ao assinar.");
      setLoading(false);
      return;
    }
    setSignedName(nome);
    setCurrentStatus("Assinado");
    setLoading(false);
  }

  if (currentStatus === "Assinado") {
    return (
      <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg p-5 text-center text-sm">
        Contrato assinado eletronicamente {signedName ? `por ${signedName}` : ""}
        {assinadoEm ? ` em ${new Date(assinadoEm).toLocaleString("pt-BR")}` : ""}.
      </div>
    );
  }

  return (
    <form onSubmit={handleSign} className="bg-white border border-slate-200 rounded-lg p-5 space-y-3">
      <h2 className="text-sm font-medium text-slate-700">Assinatura eletrônica</h2>
      <p className="text-xs text-slate-500">
        Ao preencher seus dados e clicar em assinar, você concorda com os termos deste contrato. Data, hora e IP de acesso
        serão registrados como comprovante de aceite.
      </p>
      {error && (
        <div className="text-sm text-rose-700 bg-rose-50 border-l-4 border-rose-300 px-3 py-2 rounded-r-md">{error}</div>
      )}
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">Nome completo</label>
        <input
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">CPF/CNPJ</label>
        <input
          value={cpf}
          onChange={(e) => setCpf(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2.5 rounded-md disabled:opacity-50"
      >
        {loading ? "Assinando..." : "Assinar contrato"}
      </button>
    </form>
  );
}
