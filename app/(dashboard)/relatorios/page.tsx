import { Download } from "lucide-react";

const REPORTS = [
  { title: "Clientes", description: "Todos os clientes cadastrados", href: "/api/reports/clientes" },
  { title: "Orçamentos", description: "Todos os orçamentos e propostas, com status e valores", href: "/api/reports/orcamentos" },
  { title: "Projetos", description: "Todos os projetos, com status, progresso e prazo", href: "/api/reports/projetos" },
  { title: "Financeiro", description: "Todos os lançamentos de receitas e despesas", href: "/api/reports/financeiro" },
];

export default function RelatoriosPage() {
  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Relatórios</h1>
        <p className="text-slate-500 text-sm mt-1">Exportação em CSV, compatível com Excel e Google Sheets</p>
      </div>

      <div className="grid gap-3">
        {REPORTS.map((r) => (
          <a
            key={r.href}
            href={r.href}
            className="bg-white border border-slate-200 rounded-lg p-4 flex items-center justify-between hover:border-blue-300"
          >
            <div>
              <div className="font-medium text-slate-900">{r.title}</div>
              <div className="text-sm text-slate-500">{r.description}</div>
            </div>
            <Download size={18} className="text-slate-400" />
          </a>
        ))}
      </div>
    </div>
  );
}
