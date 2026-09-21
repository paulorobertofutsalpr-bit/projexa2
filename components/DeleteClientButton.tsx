"use client";

import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

export default function DeleteClientButton({ clientId }: { clientId: string }) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm("Excluir este cliente?")) return;
    await fetch(`/api/clients/${clientId}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <button onClick={handleDelete} className="text-slate-400 hover:text-rose-500 p-1">
      <Trash2 size={16} />
    </button>
  );
}
