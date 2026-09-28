"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/painel-sistema", label: "Dashboard", exact: true },
  { href: "/painel-sistema/empresas", label: "Empresas" },
  { href: "/painel-sistema/cupons", label: "Cupons" },
  { href: "/painel-sistema/vendedores", label: "Vendedores" },
  { href: "/painel-sistema/usuarios", label: "Usuários" },
  { href: "/painel-sistema/mensagens", label: "Mensagens" },
];

export default function PainelSistemaNav() {
  const pathname = usePathname();

  return (
    <div className="border-b border-slate-200 flex gap-1 overflow-x-auto">
      {TABS.map((tab) => {
        const active = tab.exact ? pathname === tab.href : pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`px-3 py-2 text-sm border-b-2 whitespace-nowrap ${
              active ? "border-blue-600 text-blue-600 font-medium" : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
