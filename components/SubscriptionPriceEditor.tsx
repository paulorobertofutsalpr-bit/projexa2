"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SubscriptionPriceEditor({ initialPrice }: { initialPrice: number }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(String(initialPrice));
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    await fetch("/api/subscription/price", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ price: parseFloat(value) }),
    });
    setSaving(false);
    setEditing(false);
    router.refresh();
  }

  if (!editing) {
    return (
      <button onClick={() => setEditing(true)} className="font-medium text-blue-600 hover:underline text-sm">
        {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(initialPrice)}/mês · editar
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        step="0.01"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-20 px-2 py-1 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button onClick={save} disabled={saving} className="text-xs text-blue-600 hover:underline">
        {saving ? "..." : "Salvar"}
      </button>
      <button onClick={() => setEditing(false)} className="text-xs text-slate-400 hover:underline">
        Cancelar
      </button>
    </div>
  );
}
