"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Archive, Copy } from "lucide-react";

export default function ProjectActions({ projectId, status }: { projectId: string; status: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function archive() {
    if (!confirm("Arquivar este projeto? Ele sai da lista principal, mas continua acessível em 'Ver arquivados'.")) return;
    setLoading(true);
    await fetch(`/api/projects/${projectId}/arquivar`, { method: "POST" });
    router.push("/projetos");
    router.refresh();
  }

  async function duplicate() {
    setLoading(true);
    const res = await fetch(`/api/projects/${projectId}/duplicar`, { method: "POST" });
    const data = await res.json();
    setLoading(false);
    if (res.ok) router.push(`/projetos/${data.id}`);
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={duplicate}
        disabled={loading}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs border border-slate-200 rounded-md hover:bg-slate-50 disabled:opacity-50"
      >
        <Copy size={13} /> Duplicar
      </button>
      {status === "Concluído" && (
        <button
          onClick={archive}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs border border-slate-200 rounded-md hover:bg-slate-50 disabled:opacity-50"
        >
          <Archive size={13} /> Arquivar
        </button>
      )}
    </div>
  );
}
