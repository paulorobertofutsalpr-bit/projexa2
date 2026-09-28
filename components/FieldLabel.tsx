import InfoTooltip from "./InfoTooltip";

export default function FieldLabel({ label, info }: { label: string; info?: string }) {
  return (
    <label className="flex items-center text-xs font-medium text-slate-600 mb-1">
      {label}
      {info && <InfoTooltip text={info} />}
    </label>
  );
}
