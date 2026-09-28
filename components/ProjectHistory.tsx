"use client";

import { useEffect, useState } from "react";

type Note = {
  id: string;
  userId: string;
  userName: string;
  texto: string;
  editedAt: string | null;
  createdAt: string;
};

export default function ProjectHistory({
  projectId,
  currentUserId,
  isAdmin,
}: {
  projectId: string;
  currentUserId: string;
  isAdmin: boolean;
}) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  function load() {
    fetch(`/api/projects/${projectId}/notes`)
      .then((r) => r.json())
      .then((data) => {
        setNotes(data.notes || []);
        setLoading(false);
      });
  }

  useEffect(() => {
    load();
  }, [projectId]);

  async function addNote(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setSaving(true);
    await fetch(`/api/projects/${projectId}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ texto: text }),
    });
    setText("");
    setSaving(false);
    load();
  }

  async function saveEdit(id: string) {
    if (!editText.trim()) return;
    await fetch(`/api/project-notes/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ texto: editText }),
    });
    setEditingId(null);
    load();
  }

  async function remove(id: string) {
    if (!confirm("Excluir este registro do histórico?")) return;
    await fetch(`/api/project-notes/${id}`, { method: "DELETE" });
    load();
  }

  function canManage(note: Note) {
    return note.userId === currentUserId || isAdmin;
  }

  return (
    <div className="space-y-3">
      <form onSubmit={addNote} className="bg-white border border-slate-200 rounded-lg p-4">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Escreva uma observação, atualização ou registro sobre este projeto..."
          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={2}
        />
        <div className="flex justify-end mt-2">
          <button
            type="submit"
            disabled={saving || !text.trim()}
            className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? "Salvando..." : "Adicionar ao histórico"}
          </button>
        </div>
      </form>

      {loading ? (
        <p className="text-sm text-slate-400">Carregando histórico...</p>
      ) : (
        <div className="space-y-2">
          {notes.map((n) => (
            <div key={n.id} className="bg-white border border-slate-200 rounded-lg p-4">
              {editingId === n.id ? (
                <div className="space-y-2">
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={2}
                  />
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setEditingId(null)} className="text-xs text-slate-500 hover:underline">
                      Cancelar
                    </button>
                    <button onClick={() => saveEdit(n.id)} className="text-xs text-blue-600 hover:underline">
                      Salvar
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-sm text-slate-800 whitespace-pre-line">{n.texto}</p>
                  <div className="flex items-center justify-between mt-2">
                    <div className="text-xs text-slate-400">
                      {n.userName} · {new Date(n.createdAt).toLocaleString("pt-BR")}
                      {n.editedAt && " (editado)"}
                    </div>
                    {canManage(n) && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingId(n.id);
                            setEditText(n.texto);
                          }}
                          className="text-xs text-slate-500 hover:text-blue-600"
                        >
                          Editar
                        </button>
                        <button onClick={() => remove(n.id)} className="text-xs text-slate-500 hover:text-rose-600">
                          Excluir
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
          {notes.length === 0 && <p className="text-sm text-slate-400 text-center py-6">Nenhum registro no histórico ainda.</p>}
        </div>
      )}
    </div>
  );
}
