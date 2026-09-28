"use client";

import Link from "next/link";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Não foi possível entrar.");
        setLoading(false);
        return;
      }
      window.location.href = "/dashboard";
    } catch {
      setError("Erro de conexão. Tente novamente.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white">
      {/* Painel de marca */}
      <div
        className="relative overflow-hidden md:w-1/2 flex flex-col justify-between px-8 py-10 md:px-14 md:py-14 text-white"
        style={{ background: "linear-gradient(160deg, #0B1D3A 0%, #14357A 55%, #2563EB 100%)" }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 w-96 h-96 rounded-full"
          style={{ background: "radial-gradient(closest-side, rgba(255,255,255,0.10), transparent)" }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -left-10 bottom-0 w-72 h-72 rounded-full"
          style={{ background: "radial-gradient(closest-side, rgba(255,255,255,0.08), transparent)" }}
        />

        <div className="flex items-center gap-3 relative">
          <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center font-bold text-lg">
            Pj
          </div>
          <span className="text-2xl font-semibold tracking-tight">Projexa</span>
        </div>

        <div className="relative my-10 md:my-0">
          <h1 className="text-3xl md:text-4xl font-semibold leading-tight max-w-md">
            Gestão completa para escritórios de engenharia e arquitetura.
          </h1>
          <p className="text-blue-100/90 mt-4 max-w-sm text-sm md:text-base">
            Do orçamento à entrega: clientes, propostas, projetos, documentos e financeiro em um só lugar.
          </p>

          <div className="mt-8 space-y-3 max-w-sm">
            {[
              "Propostas com aprovação digital do cliente",
              "Acompanhamento de projeto por link público",
              "Financeiro, contratos e documentos centralizados",
            ].map((item) => (
              <div key={item} className="flex items-start gap-2.5 text-sm text-blue-50/90">
                <span className="mt-0.5 w-4 h-4 shrink-0 rounded-full bg-white/20 flex items-center justify-center text-[10px]">
                  ✓
                </span>
                {item}
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-xs text-blue-200/70">© {new Date().getFullYear()} Projexa</p>
      </div>

      {/* Formulário */}
      <div className="flex-1 flex items-center justify-center px-4 py-10 bg-slate-50">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-slate-900">Bem-vindo de volta</h2>
            <p className="text-sm text-slate-500 mt-1">Acesse sua conta do escritório</p>
          </div>
          <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-lg p-6 space-y-4">
            {error && (
              <div className="text-sm text-rose-700 bg-rose-50 border-l-4 border-rose-300 px-3 py-2 rounded-r-md">
                {error}
              </div>
            )}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">E-mail</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Senha</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 rounded-md disabled:opacity-50"
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>
          <p className="text-center text-sm text-slate-500 mt-4">
            Ainda não tem uma conta?{" "}
            <Link href="/cadastro" className="text-blue-600 font-medium hover:underline">
              Criar conta grátis
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
