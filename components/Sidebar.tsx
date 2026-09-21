"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Users, FileText, FolderKanban, DollarSign, AlertCircle, History, BarChart3, Settings, LogOut, Menu, X } from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Painel", icon: LayoutDashboard },
  { href: "/pendencias", label: "Pendências", icon: AlertCircle },
  { href: "/clientes", label: "Clientes", icon: Users },
  { href: "/orcamentos", label: "Orçamentos", icon: FileText },
  { href: "/projetos", label: "Projetos", icon: FolderKanban },
  { href: "/financeiro", label: "Financeiro", icon: DollarSign },
  { href: "/relatorios", label: "Relatórios", icon: BarChart3 },
  { href: "/atividades", label: "Atividades", icon: History },
  { href: "/configuracoes", label: "Configurações", icon: Settings },
];

function SidebarContent({
  userName,
  companyName,
  logoData,
  pathname,
  onNavigate,
  onLogout,
}: {
  userName: string;
  companyName: string;
  logoData?: string | null;
  pathname: string;
  onNavigate: () => void;
  onLogout: () => void;
}) {
  return (
    <>
      <div className="h-16 flex items-center gap-2 px-6 border-b border-white/10 shrink-0">
        {logoData ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logoData} alt={companyName} className="w-8 h-8 rounded object-contain bg-white/5" />
        ) : (
          <div className="w-8 h-8 rounded bg-blue-600 text-white flex items-center justify-center font-semibold text-sm">
            Pj
          </div>
        )}
        <span className="text-white font-semibold text-lg tracking-tight truncate">{companyName || "Projexa"}</span>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors ${
                active ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon size={18} strokeWidth={1.75} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="px-4 py-4 border-t border-white/10 shrink-0">
        <div className="text-xs text-slate-400 px-2 mb-2">
          <div className="text-slate-200 font-medium">{userName}</div>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm text-slate-300 hover:bg-white/5 hover:text-white"
        >
          <LogOut size={16} />
          Sair
        </button>
      </div>
    </>
  );
}

export default function Sidebar({
  userName,
  companyName,
  logoData,
}: {
  userName: string;
  companyName: string;
  logoData?: string | null;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4">
        <button onClick={() => setMobileOpen(true)} className="text-slate-600" aria-label="Abrir menu">
          <Menu size={22} />
        </button>
        <div className="flex items-center gap-2">
          {logoData ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoData} alt={companyName} className="w-6 h-6 rounded object-contain" />
          ) : (
            <div className="w-6 h-6 rounded bg-blue-600 text-white flex items-center justify-center font-semibold text-[10px]">
              Pj
            </div>
          )}
          <span className="font-semibold text-sm text-slate-900 truncate max-w-[160px]">{companyName || "Projexa"}</span>
        </div>
        <div className="w-6" />
      </div>


      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-slate-900/50" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-72 max-w-[85vw] flex flex-col" style={{ backgroundColor: "#0B1D3A" }}>
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 text-slate-300 hover:text-white"
              aria-label="Fechar menu"
            >
              <X size={20} />
            </button>
            <SidebarContent
              userName={userName}
              companyName={companyName}
              logoData={logoData}
              pathname={pathname}
              onNavigate={() => setMobileOpen(false)}
              onLogout={handleLogout}
            />
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="w-64 shrink-0 hidden md:flex md:flex-col" style={{ backgroundColor: "#0B1D3A" }}>
        <SidebarContent
          userName={userName}
          companyName={companyName}
          logoData={logoData}
          pathname={pathname}
          onNavigate={() => {}}
          onLogout={handleLogout}
        />
      </aside>
    </>
  );
}
