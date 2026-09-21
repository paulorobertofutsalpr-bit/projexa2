"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

export default function CopyLinkBox({ path, label }: { path: string; label: string }) {
  const [copied, setCopied] = useState(false);
  const url = typeof window !== "undefined" ? `${window.location.origin}${path}` : "";

  function copy() {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5">
      <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
      <div className="flex gap-2">
        <input readOnly value={url} className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-md bg-slate-50" />
        <button onClick={copy} className="px-3 py-2 text-sm border border-slate-200 rounded-md hover:bg-slate-50 flex items-center gap-1">
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? "Copiado" : "Copiar"}
        </button>
      </div>
    </div>
  );
}
