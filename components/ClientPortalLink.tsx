"use client";

import { useState } from "react";
import { Copy, Check, Link2 } from "lucide-react";

export default function ClientPortalLink({ clientId, portalToken }: { clientId: string; portalToken: string | null }) {
  const [token, setToken] = useState(portalToken);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const url = token && typeof window !== "undefined" ? `${window.location.origin}/portal/${token}` : "";

  async function generate() {
    setLoading(true);
    const res = await fetch(`/api/clients/${clientId}/portal-link`, { method: "POST" });
    const data = await res.json();
    if (res.ok) setToken(data.token);
    setLoading(false);
  }

  function copy() {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5">
      <h2 className="text-xs uppercase tracking-wide text-slate-400 mb-2">Portal do cliente</h2>
      {!token ? (
        <button
          onClick={generate}
          disabled={loading}
          className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline disabled:opacity-50"
        >
          <Link2 size={14} /> {loading ? "Gerando..." : "Gerar link do portal"}
        </button>
      ) : (
        <div className="flex gap-2">
          <input readOnly value={url} className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-md bg-slate-50" />
          <button onClick={copy} className="px-3 py-2 text-sm border border-slate-200 rounded-md hover:bg-slate-50 flex items-center gap-1">
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? "Copiado" : "Copiar"}
          </button>
        </div>
      )}
      <p className="text-xs text-slate-400 mt-2">
        Esse link é permanente e mostra ao cliente seus projetos, propostas e documentos liberados — sem precisar de conta.
      </p>
    </div>
  );
}
