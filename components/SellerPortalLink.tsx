"use client";

import { useEffect, useState } from "react";
import { Copy, Check, ExternalLink } from "lucide-react";

export default function SellerPortalLink({ sellerId }: { sellerId: string }) {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/sellers/${sellerId}/portal-link`, { method: "POST" })
      .then((res) => res.json())
      .then((data) => setToken(data.token || null))
      .finally(() => setLoading(false));
  }, [sellerId]);

  const url = token && typeof window !== "undefined" ? `${window.location.origin}/vendedor/${token}` : "";

  function copy() {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5">
      <h2 className="text-xs uppercase tracking-wide text-slate-400 mb-2">Link externo do vendedor</h2>
      {loading ? (
        <p className="text-sm text-slate-400">Gerando link...</p>
      ) : (
        <div className="flex gap-2">
          <input readOnly value={url} className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-md bg-slate-50" />
          <button
            onClick={copy}
            className="px-3 py-2 text-sm border border-slate-200 rounded-md hover:bg-slate-50 flex items-center gap-1"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? "Copiado" : "Copiar"}
          </button>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-2 text-sm border border-slate-200 rounded-md hover:bg-slate-50 flex items-center gap-1"
          >
            <ExternalLink size={14} />
          </a>
        </div>
      )}
      <p className="text-xs text-slate-400 mt-2">
        Envie esse link para o vendedor. Ele consegue ver, todo mês, quantos clientes indicados estão ativos,
        cancelados ou atrasados, e o valor total de comissão a receber — sem precisar de login.
      </p>
    </div>
  );
}
