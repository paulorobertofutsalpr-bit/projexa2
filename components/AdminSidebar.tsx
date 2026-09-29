"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  CreditCard,
  Package,
  Ticket,
  Users2,
  MessageSquare,
  UsersRound,
  LogOut,
  ArrowLeft,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/clientes", label: "Clientes", icon: Building2 },
  { href: "/admin/assinaturas", label: "Assinaturas", icon: CreditCard },
  { href: "/admin/planos", label: "Planos", icon: Package },
  { href: "/admin/cupons", label: "Cupons", icon: Ticket },
  { href: "/admin/vendedores", label: "Vendedores", icon: Users2 },
  { href: "/admin/usuarios", label: "Usuários", icon: UsersRound },
  { href: "/admin/mensagens", label: "Mensagens", icon: MessageSquare },
];

export default function AdminSidebar({ userName }: { userName: string }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="w-64 shrink-0 bg-[#0B1D3A] text-white min-h-screen flex flex-col">
      <div className="h-16 flex items-center gap-2 px-6 border-b border-white/10 shrink-0">
        <div className="w-8 h-8 rounded bg-blue-600 text-white flex items-center justify-center font-semibold text-sm">
          Pj
        </div>
        <div>
          <div className="text-white font-semibold text-sm leading-tight">Projexa</div>
          <div className="text-blue-200/70 text-[11px] leading-tight">Administração</div>
        </div>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
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
      <div className="px-4 py-4 border-t border-white/10 shrink-0 space-y-2">
        <div className="text-xs text-slate-400 px-2">
          Logado como <span className="text-slate-200 font-medium">{userName}</span>
        </div>
        <Link
          href="/dashboard"
          className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm text-slate-300 hover:bg-white/5 hover:text-white"
        >
          <ArrowLeft size={16} />
          Voltar ao sistema
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm text-slate-300 hover:bg-white/5 hover:text-white"
        >
          <LogOut size={16} />
          Sair
        </button>
      </div>
    </div>
  );
}
