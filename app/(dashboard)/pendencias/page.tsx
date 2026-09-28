import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db";
import { budgets, projects, financialEntries, clients } from "@/db/schema";
import { eq } from "drizzle-orm";
import { formatBRL, formatDate } from "@/lib/format";
import { computeDisplayStatus } from "@/lib/finance";
import { AlertTriangle, Clock, FileText } from "lucide-react";

export const dynamic = "force-dynamic";

function daysUntil(dateStr: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr + "T00:00:00");
  return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export default async function PendenciasPage() {
  const user = await getCurrentUser();
  const companyId = user!.companyId;

  const [budgetRows, projectRows, financeRows, clientRows] = await Promise.all([
    db.select().from(budgets).where(eq(budgets.companyId, companyId)),
    db.select().from(projects).where(eq(projects.companyId, companyId)),
    db.select().from(financialEntries).where(eq(financialEntries.companyId, companyId)),
    db.select().from(clients).where(eq(clients.companyId, companyId)),
  ]);

  const clientName = (id: string) => clientRows.find((c) => c.id === id)?.nome || "—";

  type Item = { tone: "danger" | "warning" | "info"; icon: typeof AlertTriangle; text: string; href: string };
  const items: Item[] = [];

  budgetRows
    .filter((b) => b.status === "Enviado")
    .forEach((b) =>
      items.push({
        tone: "info",
        icon: FileText,
        text: `Orçamento ${b.numero} aguardando resposta de ${clientName(b.clientId)}.`,
        href: `/orcamentos/${b.id}`,
      })
    );

  const approvedWithoutProject = await Promise.all(
    budgetRows
      .filter((b) => b.status === "Aprovado")
      .map(async (b) => {
        const hasProject = projectRows.some((p) => p.budgetId === b.id);
        return hasProject ? null : b;
      })
  );
  approvedWithoutProject
    .filter((b): b is typeof budgetRows[number] => b !== null)
    .forEach((b) =>
      items.push({
        tone: "info",
        icon: FileText,
        text: `Orçamento ${b.numero} aprovado e ainda não convertido em projeto.`,
        href: `/orcamentos/${b.id}`,
      })
    );

  financeRows
    .filter((f) => computeDisplayStatus(f.status, f.vencimento) === "Atrasado")
    .forEach((f) =>
      items.push({
        tone: "danger",
        icon: AlertTriangle,
        text: `${f.tipo === "receita" ? "Recebimento" : "Pagamento"} de ${formatBRL(f.valor)} ("${f.descricao}") está atrasado desde ${formatDate(f.vencimento)}.`,
        href: "/financeiro",
      })
    );

  financeRows
    .filter((f) => {
      const d = daysUntil(f.vencimento);
      return computeDisplayStatus(f.status, f.vencimento) === "Pendente" && d >= 0 && d <= 7;
    })
    .forEach((f) =>
      items.push({
        tone: "warning",
        icon: Clock,
        text: `${f.tipo === "receita" ? "Recebimento" : "Pagamento"} de ${formatBRL(f.valor)} ("${f.descricao}") vence em ${daysUntil(f.vencimento)} dia(s).`,
        href: "/financeiro",
      })
    );

  projectRows
    .filter((p) => p.status !== "Concluído" && p.status !== "Cancelado" && p.prazo)
    .forEach((p) => {
      const d = daysUntil(p.prazo!);
      if (d < 0) {
        items.push({
          tone: "danger",
          icon: AlertTriangle,
          text: `Projeto "${p.nome}" está com prazo vencido (${formatDate(p.prazo!)}).`,
          href: `/projetos/${p.id}`,
        });
      } else if (d <= 15) {
        items.push({
          tone: "warning",
          icon: Clock,
          text: `Projeto "${p.nome}" vence em ${d} dia(s).`,
          href: `/projetos/${p.id}`,
        });
      }
    });

  const toneClasses = {
    danger: "border-rose-300 bg-rose-50 text-rose-700",
    warning: "border-amber-300 bg-amber-50 text-amber-700",
    info: "border-blue-300 bg-blue-50 text-blue-700",
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Central de pendências</h1>
        <p className="text-slate-500 text-sm mt-1">{items.length} itens que exigem sua atenção</p>
      </div>

      <div className="space-y-2">
        {items.map((item, i) => {
          const Icon = item.icon;
          return (
            <Link
              key={i}
              href={item.href}
              className={`flex items-start gap-3 px-4 py-3 border-l-4 rounded-r-md hover:opacity-80 ${toneClasses[item.tone]}`}
            >
              <Icon size={16} className="mt-0.5 shrink-0" />
              <span className="text-sm">{item.text}</span>
            </Link>
          );
        })}
        {items.length === 0 && (
          <div className="bg-white border border-slate-200 rounded-lg p-8 text-center text-sm text-slate-400">
            Nenhuma pendência no momento. Tudo em dia!
          </div>
        )}
      </div>
    </div>
  );
}
