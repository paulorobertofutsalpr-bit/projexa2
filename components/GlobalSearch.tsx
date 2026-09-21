"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

type Results = {
  clients: { id: string; nome: string; documento: string | null }[];
  budgets: { id: string; numero: string }[];
  projects: { id: string; numero: string; nome: string }[];
};

export default function GlobalSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Results | null>(null);
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults(null);
      return;
    }
    const timeout = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(query)}`)
        .then((r) => r.json())
        .then((data) => {
          setResults(data);
          setOpen(true);
        });
    }, 250);
    return () => clearTimeout(timeout);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function go(href: string) {
    setOpen(false);
    setQuery("");
    router.push(href);
  }

  const hasResults =
    results && (results.clients.length > 0 || results.budgets.length > 0 || results.projects.length > 0);

  return (
    <div ref={boxRef} className="relative w-full max-w-sm">
      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => query.length >= 2 && setOpen(true)}
        placeholder="Buscar cliente, orçamento ou projeto..."
        className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      {open && results && (
        <div className="absolute z-30 mt-1 w-full bg-white border border-slate-200 rounded-md shadow-lg max-h-80 overflow-y-auto">
          {!hasResults && <p className="text-sm text-slate-400 px-4 py-3">Nenhum resultado.</p>}
          {results.clients.length > 0 && (
            <div>
              <div className="text-[10px] uppercase text-slate-400 px-4 pt-2">Clientes</div>
              {results.clients.map((c) => (
                <button
                  key={c.id}
                  onClick={() => go(`/clientes/${c.id}`)}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50"
                >
                  {c.nome} {c.documento ? <span className="text-slate-400">· {c.documento}</span> : null}
                </button>
              ))}
            </div>
          )}
          {results.budgets.length > 0 && (
            <div>
              <div className="text-[10px] uppercase text-slate-400 px-4 pt-2">Orçamentos</div>
              {results.budgets.map((b) => (
                <button
                  key={b.id}
                  onClick={() => go(`/orcamentos/${b.id}`)}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50"
                >
                  {b.numero}
                </button>
              ))}
            </div>
          )}
          {results.projects.length > 0 && (
            <div>
              <div className="text-[10px] uppercase text-slate-400 px-4 pt-2">Projetos</div>
              {results.projects.map((p) => (
                <button
                  key={p.id}
                  onClick={() => go(`/projetos/${p.id}`)}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50"
                >
                  {p.numero} · {p.nome}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
