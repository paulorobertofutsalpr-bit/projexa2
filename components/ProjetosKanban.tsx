"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";

type Project = {
  id: string;
  numero: string;
  nome: string;
  status: string;
  progresso: number;
  prazo: string | null;
  prioridade: string;
  clientName: string;
};

const STATUSES = ["Planejamento", "Em andamento", "Em revisão", "Aguardando cliente", "Pausado", "Concluído"];

export default function ProjetosKanban({ projects }: { projects: Project[] }) {
  const router = useRouter();

  async function updateStatus(id: string, status: string) {
    await fetch(`/api/projects/${id}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    router.refresh();
  }

  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      {STATUSES.map((status) => {
        const items = projects.filter((p) => p.status === status);
        return (
          <div key={status} className="w-56 shrink-0">
            <div className="flex items-center justify-between mb-1.5 px-1">
              <h3 className="text-xs font-medium text-slate-600 truncate">{status}</h3>
              <span className="text-[10px] text-slate-400 shrink-0 ml-1">{items.length}</span>
            </div>
            <div className="space-y-1.5 bg-slate-100/70 rounded-lg p-1.5 max-h-[calc(100vh-260px)] overflow-y-auto">
              {items.map((p) => (
                <div key={p.id} className="bg-white rounded-md border border-slate-200 p-2 shadow-sm">
                  <div className="text-[10px] text-slate-400 mb-0.5" style={{ fontFamily: "ui-monospace, monospace" }}>
                    {p.numero}
                  </div>
                  <Link href={`/projetos/${p.id}`} className="font-medium text-xs text-slate-900 mb-1 hover:text-blue-600 block leading-snug">
                    {p.nome}
                  </Link>
                  <div className="text-[10px] text-slate-500 mb-1.5 truncate">{p.clientName}</div>
                  <div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden mb-1.5">
                    <div className="h-full bg-blue-600 rounded-full" style={{ width: `${p.progresso}%` }} />
                  </div>
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[10px] text-slate-400 truncate">{p.prazo || "Sem prazo"}</span>
                    <select
                      value={p.status}
                      onChange={(e) => updateStatus(p.id, e.target.value)}
                      className="text-[10px] border border-slate-200 rounded px-1 py-0.5 text-slate-600 bg-white shrink-0"
                    >
                      {STATUSES.concat("Cancelado").map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
