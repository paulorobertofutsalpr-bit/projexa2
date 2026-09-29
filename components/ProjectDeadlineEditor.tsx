"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deadlineTone, deadlineLabel, DEADLINE_TONE_CLASSES } from "@/lib/deadline";

const PRIORIDADES = ["Baixa", "Média", "Alta"];

const PRIORITY_BADGE: Record<string, string> = {
  Alta: "bg-rose-100 text-rose-700",
  Média: "bg-amber-100 text-amber-700",
  Baixa: "bg-slate-100 text-slate-600",
};

export default function ProjectDeadlineEditor({
  projectId,
  prazo,
  prioridade,
  done,
}: {
  projectId: string;
  prazo: string | null;
  prioridade: string;
  done: boolean;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [prazoValue, setPrazoValue] = useState(prazo || "");
  const [prioridadeValue, setPrioridadeValue] = useState(prioridade);
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    await fetch(`/api/projects/${projectId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prazo: prazoValue || null, prioridade: prioridadeValue }),
    });
    setSaving(false);
    setEditing(false);
    router.refresh();
  }

  if (editing) {
    return (
      <div className="grid grid-cols-2 gap-4 text-sm bg-slate-50 border border-slate-200 rounded-md p-3">
        <div>
          <label className="block text-xs text-slate-400 mb-1">Prazo final</label>
          <input
            type="date"
            value={prazoValue}
            onChange={(e) => setPrazoValue(e.target.value)}
            className="w-full px-2 py-1.5 text-sm border border-slate-200 rounded-md"
          />
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1">Prioridade</label>
          <select
            value={prioridadeValue}
            onChange={(e) => setPrioridadeValue(e.target.value)}
            className="w-full px-2 py-1.5 text-sm border border-slate-200 rounded-md"
          >
            {PRIORIDADES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
        <div className="col-span-2 flex gap-2">
          <button
            onClick={save}
            disabled={saving}
            className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md disabled:opacity-50"
          >
            {saving ? "Salvando..." : "Salvar"}
          </button>
          <button onClick={() => setEditing(false)} className="text-xs text-slate-500 px-3 py-1.5 rounded-md hover:bg-slate-100">
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  const tone = deadlineTone(prazo, done);

  return (
    <div className="grid grid-cols-2 gap-4 text-sm">
      <div>
        <div className="text-xs text-slate-400 mb-1">Prazo</div>
        <span className={`inline-block text-xs font-medium px-2 py-1 rounded-full ${DEADLINE_TONE_CLASSES[tone]}`}>
          {deadlineLabel(prazo, done)}
        </span>
      </div>
      <div>
        <div className="text-xs text-slate-400 mb-1">Prioridade</div>
        <span className={`inline-block text-xs font-medium px-2 py-1 rounded-full ${PRIORITY_BADGE[prioridade] || "bg-slate-100 text-slate-600"}`}>
          {prioridade}
        </span>
      </div>
      <div className="col-span-2">
        <button onClick={() => setEditing(true)} className="text-xs text-blue-600 hover:underline">
          Editar prazo / prioridade
        </button>
      </div>
    </div>
  );
}
