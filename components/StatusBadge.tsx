const STATUS_STYLES: Record<string, string> = {
  Rascunho: "bg-slate-100 text-slate-700",
  Enviado: "bg-blue-100 text-blue-700",
  Aprovado: "bg-emerald-100 text-emerald-700",
  Recusado: "bg-red-100 text-red-700",
};

export default function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[status] || "bg-slate-100 text-slate-700"}`}>
      {status}
    </span>
  );
}
