"use client";

import { useEffect, useState } from "react";
import MessagesThread from "./MessagesThread";

type CompanyRow = {
  id: string;
  name: string;
  lastMessageAt: string | null;
  lastMessageBody: string | null;
  unreadCount: number;
};

export default function AdminMessagesPanel() {
  const [companies, setCompanies] = useState<CompanyRow[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    const res = await fetch("/api/admin/messages");
    const data = await res.json();
    setCompanies(data.companies || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex gap-4 h-[70vh]">
      <div className="w-72 shrink-0 bg-white border border-slate-200 rounded-lg overflow-y-auto">
        {!loading && companies.length === 0 && (
          <p className="text-sm text-slate-400 text-center mt-8 px-4">
            Nenhuma empresa enviou mensagens ainda.
          </p>
        )}
        {companies.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelected(c.id)}
            className={`w-full text-left px-4 py-3 border-b border-slate-100 last:border-0 hover:bg-slate-50 ${
              selected === c.id ? "bg-blue-50" : ""
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-900 truncate">{c.name}</span>
              {c.unreadCount > 0 && (
                <span className="bg-blue-600 text-white text-[10px] rounded-full px-1.5 py-0.5 ml-2 shrink-0">
                  {c.unreadCount}
                </span>
              )}
            </div>
            {c.lastMessageBody && (
              <p className="text-xs text-slate-500 truncate mt-0.5">{c.lastMessageBody}</p>
            )}
          </button>
        ))}
      </div>
      <div className="flex-1">
        {selected ? (
          <MessagesThread
            key={selected}
            fetchUrl={`/api/admin/messages/${selected}`}
            postUrl={`/api/admin/messages/${selected}`}
            viewerIsSuperAdmin={true}
            emptyLabel="Nenhuma mensagem com esta empresa ainda."
          />
        ) : (
          <div className="h-full flex items-center justify-center bg-white border border-slate-200 rounded-lg">
            <p className="text-sm text-slate-400">Selecione uma empresa à esquerda para ver a conversa.</p>
          </div>
        )}
      </div>
    </div>
  );
}
