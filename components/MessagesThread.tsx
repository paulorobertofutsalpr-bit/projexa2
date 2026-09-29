"use client";

import { useEffect, useRef, useState } from "react";

type Message = {
  id: string;
  companyId: string;
  senderId: string;
  senderName: string;
  fromSuperAdmin: boolean;
  body: string;
  readAt: string | null;
  createdAt: string;
};

export default function MessagesThread({
  fetchUrl,
  postUrl,
  viewerIsSuperAdmin,
  emptyLabel,
}: {
  fetchUrl: string;
  postUrl: string;
  viewerIsSuperAdmin: boolean;
  emptyLabel: string;
}) {
  const [msgs, setMsgs] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  async function load() {
    const res = await fetch(fetchUrl);
    if (!res.ok) {
      setLoading(false);
      return;
    }
    const data = await res.json();
    setMsgs(data.messages || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, 8000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchUrl]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs.length]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const body = text.trim();
    if (!body) return;
    setSending(true);
    setError(null);
    const res = await fetch(postUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body }),
    });
    const data = await res.json();
    setSending(false);
    if (!res.ok) {
      setError(data.error || "Erro ao enviar mensagem.");
      return;
    }
    setText("");
    load();
  }

  return (
    <div className="flex flex-col h-[65vh] bg-white border border-slate-200 rounded-lg overflow-hidden">
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {!loading && msgs.length === 0 && (
          <p className="text-sm text-slate-400 text-center mt-8">{emptyLabel}</p>
        )}
        {msgs.map((m) => {
          const mine = m.fromSuperAdmin === viewerIsSuperAdmin;
          return (
            <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[75%] rounded-lg px-3 py-2 text-sm ${
                  mine ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-800"
                }`}
              >
                <div className={`text-[11px] mb-0.5 ${mine ? "text-blue-100" : "text-slate-500"}`}>
                  {m.fromSuperAdmin ? "Administrador do sistema" : m.senderName}
                </div>
                <div className="whitespace-pre-wrap break-words">{m.body}</div>
                <div className={`text-[10px] mt-1 ${mine ? "text-blue-100" : "text-slate-400"}`}>
                  {new Date(m.createdAt).toLocaleString("pt-BR")}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={handleSend} className="border-t border-slate-200 p-3 flex gap-2 items-end">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend(e);
            }
          }}
          rows={2}
          placeholder="Escreva uma mensagem..."
          className="flex-1 resize-none px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={sending || !text.trim()}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-md disabled:opacity-50"
        >
          Enviar
        </button>
      </form>
      {error && <p className="px-4 pb-2 text-xs text-rose-600">{error}</p>}
    </div>
  );
}
