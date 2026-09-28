"use client";

import { useEffect, useState } from "react";

type Row = {
  id: string;
  name: string;
  email: string;
  role: string;
  isSuperAdmin: boolean;
  companyName: string;
  createdAt: string;
};

export default function AdminUsersTable({ currentUserId }: { currentUserId: string }) {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/users");
    const data = await res.json();
    setRows(data.users || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function toggleSuperAdmin(id: string, value: boolean) {
    setError(null);
    const res = await fetch(`/api/admin/users/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isSuperAdmin: value }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Erro ao atualizar.");
      return;
    }
    load();
  }

  return (
    <div className="space-y-2">
      {error && <p className="text-sm text-rose-600">{error}</p>}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wide">
            <tr>
              <th className="text-left px-4 py-2 font-medium">Usuário</th>
              <th className="text-left px-4 py-2 font-medium">Empresa</th>
              <th className="text-left px-4 py-2 font-medium">Papel</th>
              <th className="text-left px-4 py-2 font-medium">Administrador do sistema</th>
            </tr>
          </thead>
          <tbody>
            {!loading &&
              rows.map((r) => (
                <tr key={r.id} className="border-b border-slate-100 last:border-0">
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-slate-900">{r.name}</div>
                    <div className="text-xs text-slate-400">{r.email}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">{r.companyName}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{r.role}</td>
                  <td className="px-4 py-3">
                    <label className="flex items-center gap-2 text-xs text-slate-600">
                      <input
                        type="checkbox"
                        checked={r.isSuperAdmin}
                        onChange={(e) => toggleSuperAdmin(r.id, e.target.checked)}
                      />
                      {r.isSuperAdmin ? "Sim" : "Não"}
                      {r.id === currentUserId && <span className="text-slate-400">(você)</span>}
                    </label>
                  </td>
                </tr>
              ))}
            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-sm text-slate-400">
                  Nenhum usuário encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
