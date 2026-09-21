export default function ScopeList({
  title,
  text,
  tone,
}: {
  title: string;
  text: string | null;
  tone: "positive" | "negative";
}) {
  if (!text) return null;
  const items = text.split("\n").map((l) => l.trim()).filter(Boolean);
  if (items.length === 0) return null;

  const dot = tone === "positive" ? "bg-emerald-500" : "bg-slate-300";

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5">
      <h2 className="text-xs uppercase tracking-wide text-slate-400 mb-3">{title}</h2>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
            <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${dot}`} />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
