"use client";

import { useRouter } from "next/navigation";

export default function RestoreProjectButton({ projectId }: { projectId: string }) {
  const router = useRouter();

  async function restore() {
    await fetch(`/api/projects/${projectId}/restaurar`, { method: "POST" });
    router.refresh();
  }

  return (
    <button onClick={restore} className="text-xs text-blue-600 hover:underline">
      Restaurar
    </button>
  );
}
