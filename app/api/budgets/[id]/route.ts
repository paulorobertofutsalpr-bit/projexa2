import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { budgets, budgetItems } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { logActivity } from "@/lib/activity";
import { randomUUID } from "crypto";

type ItemInput = {
  nome?: string;
  categoria?: string;
  observacoes?: string;
  quantidade?: number;
  unidade?: string;
  valorUnitario?: number;
  desconto?: number;
};

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const { id } = await params;
  const body = await request.json().catch(() => null);

  const rows = await db.select().from(budgets).where(and(eq(budgets.id, id), eq(budgets.companyId, user.companyId)));
  const budget = rows[0];
  if (!budget) return NextResponse.json({ error: "Orçamento não encontrado." }, { status: 404 });

  const items = Array.isArray(body?.itens) ? (body.itens as ItemInput[]) : [];
  const validItems = items
    .filter((i) => i.nome?.trim() && Number(i.valorUnitario) > 0)
    .map((i) => {
      const quantidade = Number(i.quantidade) || 1;
      const valorUnitarioCentavos = Math.round(Number(i.valorUnitario) * 100);
      const descontoCentavos = Math.round((Number(i.desconto) || 0) * 100);
      const totalCentavos = Math.max(0, Math.round(quantidade * valorUnitarioCentavos) - descontoCentavos);
      return {
        nome: i.nome!.trim(),
        categoria: i.categoria?.trim() || "Serviço",
        observacoes: i.observacoes?.trim() || null,
        quantidade,
        unidade: i.unidade?.trim() || "Serviço",
        valorUnitarioCentavos,
        descontoCentavos,
        totalCentavos,
      };
    });

  if (!body?.clientId || validItems.length === 0) {
    return NextResponse.json({ error: "Selecione um cliente e ao menos um item válido." }, { status: 400 });
  }

  const total = validItems.reduce((s, i) => s + i.totalCentavos, 0);

  await db
    .update(budgets)
    .set({
      clientId: body.clientId,
      objeto: body.objeto || null,
      validadeDias: parseInt(body.validadeDias) || 15,
      condicaoPagamento: body.condicaoPagamento || null,
      formaPagamento: body.formaPagamento || null,
      prazoExecucao: body.prazoExecucao || null,
      previsaoInicio: body.previsaoInicio || null,
      localExecucao: body.localExecucao || null,
      responsavelTecnico: body.responsavelTecnico || null,
      garantia: body.garantia || null,
      escopoIncluso: body.escopoIncluso || null,
      escopoNaoIncluso: body.escopoNaoIncluso || null,
      observacoesComerciais: body.observacoesComerciais || null,
      total,
    })
    .where(and(eq(budgets.id, id), eq(budgets.companyId, user.companyId)));

  // Substitui os itens: apaga os antigos e insere os novos.
  await db.delete(budgetItems).where(eq(budgetItems.budgetId, id));
  for (const item of validItems) {
    await db.insert(budgetItems).values({
      id: randomUUID(),
      budgetId: id,
      categoria: item.categoria,
      nome: item.nome,
      observacoes: item.observacoes,
      quantidade: item.quantidade,
      unidade: item.unidade,
      valorUnitario: item.valorUnitarioCentavos,
      desconto: item.descontoCentavos,
      valor: item.totalCentavos,
    });
  }

  await logActivity({
    companyId: user.companyId,
    userId: user.id,
    userName: user.name,
    action: `editou o orçamento ${budget.numero}`,
    entityType: "orcamento",
    entityId: id,
  });

  return NextResponse.json({ ok: true, id });
}
