export function daysUntil(dateStr: string): number | null {
  if (!dateStr) return null;
  const target = new Date(dateStr + "T00:00:00");
  if (Number.isNaN(target.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export type DeadlineTone = "overdue" | "urgent" | "soon" | "ok" | "none";

export function deadlineTone(prazo: string | null | undefined, done = false): DeadlineTone {
  if (!prazo) return "none";
  const d = daysUntil(prazo);
  if (d === null) return "none";
  if (done) return "ok";
  if (d < 0) return "overdue";
  if (d <= 3) return "urgent";
  if (d <= 15) return "soon";
  return "ok";
}

export function deadlineLabel(prazo: string | null | undefined, done = false): string {
  if (!prazo) return "Sem prazo";
  const d = daysUntil(prazo);
  if (d === null) return prazo;
  const dateLabel = new Date(prazo + "T00:00:00").toLocaleDateString("pt-BR");
  if (done) return dateLabel;
  if (d < 0) return `Atrasado ${Math.abs(d)}d · ${dateLabel}`;
  if (d === 0) return `Vence hoje · ${dateLabel}`;
  return `Em ${d}d · ${dateLabel}`;
}

export const DEADLINE_TONE_CLASSES: Record<DeadlineTone, string> = {
  overdue: "bg-rose-100 text-rose-700 border border-rose-200",
  urgent: "bg-orange-100 text-orange-700 border border-orange-200",
  soon: "bg-amber-100 text-amber-700 border border-amber-200",
  ok: "bg-emerald-100 text-emerald-700 border border-emerald-200",
  none: "bg-slate-100 text-slate-400 border border-slate-200",
};
