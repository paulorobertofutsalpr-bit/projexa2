"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { AlertTriangle, Clock } from "lucide-react";
import { deadlineTone, deadlineLabel, DEADLINE_TONE_CLASSES } from "@/lib/deadline";

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

const COLUMN_STYLES: Record<string, { header: string; bg: string; dot: string }> = {
  "Planejamento": { header: "text-sky-700", bg: "bg-sky-50", dot: "bg-sky-500" },
  "Em andamento": { header: "text-violet-700", bg: "bg-violet-50", dot: "bg-violet-500" },
  "Em revisão": { header: "text-amber-700", bg: "bg-amber-50", dot: "bg-amber-500" },
  "Aguardando cliente": { header: "text-orange-700", bg: "bg-orange-50", dot: "bg-orange-500" },
  "Pausado": { header: "text-slate-600", bg: "bg-slate-100", dot: "bg-slate-400" },
  "Concluído": { header: "text-emerald-700", bg: "bg-emerald-50", dot: "bg-emerald-500" },
};

const PRIORITY_STRIPE: Record<string, string> = {
  Alta: "border-l-4 border-l-rose-500",
  Média: "border-l-4 border-l-amber-400",
  Baixa: "border-l-4 border-l-slate-300",
};

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

  const overdueCount = projects.filter(
    (p) => p.status !== "Concluído" && p.status !== "Cancelado" && deadlineTone(p.prazo) === "overdue"
  ).length;
  const urgentCount = projects.filter(
    (p) => p.status !== "Concluído" && p.status !== "Cancelado" && deadlineTone(p.prazo) === "urgent"
  ).length;

  return (
    <div className="space-y-3">
      {(overdueCount > 0 || urgentCount > 0) && (
        <div className="flex flex-wrap gap-2">
          {overdueCount > 0 && (
            <div className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-rose-100 text-rose-700 border border-rose-200">
              <AlertTriangle size={13} />
              {overdueCount} projeto(s) com prazo atrasado
            </div>
          )}
          {urgentCount > 0 && (
            <div className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-orange-100 text-orange-700 border border-orange-200">
              <Clock size={13} />
              {urgentCount} projeto(s) vencendo em até 3 dias
            </div>
          )}
        </div>
      )}

      <div className="flex gap-3 overflow-x-auto pb-2">
        {STATUSES.map((status) => {
          const items = projects.filter((p) => p.status === status);
          const style = COLUMN_STYLES[status] || COLUMN_STYLES["Planejamento"];
          const isDone = status === "Concluído";
          return (
            <div key={status} className="w-64 shrink-0">
              <div className={`flex items-center justify-between mb-2 px-2.5 py-1.5 rounded-md ${style.bg}`}>
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${style.dot}`} />
                  <h3 className={`text-xs font-semibold truncate ${style.header}`}>{status}</h3>
                </div>
                <span className={`text-[10px] font-semibold shrink-0 ml-1 px-1.5 py-0.5 rounded-full bg-white/70 ${style.header}`}>
                  {items.length}
                </span>
              </div>
              <div className="space-y-2 bg-slate-100/50 rounded-lg p-2 min-h-[80px] max-h-[calc(100vh-300px)] overflow-y-auto">
                {items.map((p) => {
                  const tone = deadlineTone(p.prazo, isDone);
                  return (
                    <div
                      key={p.id}
                      className={`bg-white rounded-md border border-slate-200 p-2.5 shadow-sm hover:shadow-md transition-shadow ${
                        PRIORITY_STRIPE[p.prioridade] || ""
                      }`}
                    >
                      <div className="flex items-center justify-between mb-0.5">
                        <div className="text-[10px] text-slate-400" style={{ fontFamily: "ui-monospace, monospace" }}>
                          {p.numero}
                        </div>
                        {p.prioridade === "Alta" && (
                          <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-600">
                            Alta
                          </span>
                        )}
                      </div>
                      <Link href={`/projetos/${p.id}`} className="font-medium text-xs text-slate-900 mb-1 hover:text-blue-600 block leading-snug">
                        {p.nome}
                      </Link>
                      <div className="text-[10px] text-slate-500 mb-1.5 truncate">{p.clientName}</div>
                      <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden mb-2">
                        <div
                          className={`h-full rounded-full ${isDone ? "bg-emerald-500" : "bg-blue-600"}`}
                          style={{ width: `${p.progresso}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between gap-1">
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full truncate ${DEADLINE_TONE_CLASSES[tone]}`}>
                          {deadlineLabel(p.prazo, isDone)}
                        </span>
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
                  );
                })}
                {items.length === 0 && (
                  <div className="text-[11px] text-slate-400 text-center py-4">Nenhum projeto</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
