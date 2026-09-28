"use client";

import Link from "next/link";
import { useState } from "react";

export default function CadastroPage() {
  const [companyName, setCompanyName] = useState("");
  const [adminName, setAdminName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/public/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyName, adminName, email, phone, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Não foi possível concluir o cadastro.");
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
        className="relative overflow-hidden md:w-2/5 flex flex-col justify-between px-8 py-10 md:px-14 md:py-14 text-white"
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
          <h1 className="text-2xl md:text-3xl font-semibold leading-tight max-w-md">
            Comece agora. Leva menos de um minuto.
          </h1>
          <p className="text-blue-100/90 mt-4 max-w-sm text-sm">
            Você será o administrador da sua empresa no Projexa, com seus próprios clientes, orçamentos e projetos —
            totalmente isolados de qualquer outra empresa no sistema.
          </p>
        </div>

        <p className="relative text-xs text-blue-200/70">© {new Date().getFullYear()} Projexa</p>
      </div>

      {/* Formulário */}
      <div className="flex-1 flex items-center justify-center px-4 py-10 bg-slate-50">
      <div className="w-full max-w-md">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-slate-900">Criar conta do escritório</h2>
        </div>
        <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-lg p-6 space-y-4">
          {error && (
            <div className="text-sm text-rose-700 bg-rose-50 border-l-4 border-rose-300 px-3 py-2 rounded-r-md">
              {error}
            </div>
          )}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Nome da empresa / escritório</label>
            <input
              required
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: Estúdio de Engenharia XYZ"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Seu nome</label>
            <input
              required
              value={adminName}
              onChange={(e) => setAdminName(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
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
            <label className="block text-xs font-medium text-slate-600 mb-1">Telefone (opcional)</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Senha</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Confirmar senha</label>
              <input
                type="password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 rounded-md disabled:opacity-50"
          >
            {loading ? "Criando conta..." : "Criar conta grátis"}
          </button>
        </form>
        <p className="text-center text-sm text-slate-500 mt-4">
          Já tem uma conta?{" "}
          <Link href="/login" className="text-blue-600 font-medium hover:underline">
            Entrar
          </Link>
        </p>
      </div>
      </div>
    </div>
  );
}
