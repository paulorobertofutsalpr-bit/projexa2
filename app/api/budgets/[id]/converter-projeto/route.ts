import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { budgets, budgetItems, projects, clientHistoryEvents } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { logActivity } from "@/lib/activity";
import { getNextNumber } from "@/lib/numbering";
import { randomUUID } from "crypto";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const { id } = await params;
  const rows = await db
    .select()
    .from(budgets)
    .where(and(eq(budgets.id, id), eq(budgets.companyId, user.companyId)));
  const budget = rows[0];
  if (!budget) return NextResponse.json({ error: "Orçamento não encontrado." }, { status: 404 });
  if (budget.status !== "Aprovado") {
    return NextResponse.json({ error: "Só é possível converter orçamentos aprovados." }, { status: 400 });
  }

  const existing = await db.select().from(projects).where(eq(projects.budgetId, id));
  if (existing[0]) {
    return NextResponse.json({ ok: true, id: existing[0].id, alreadyExisted: true });
  }

  const firstItem = await db.select().from(budgetItems).where(eq(budgetItems.budgetId, id));
  const projectId = randomUUID();
  const numero = await getNextNumber(user.companyId, "projeto");

  await db.insert(projects).values({
    id: projectId,
    companyId: user.companyId,
    clientId: budget.clientId,
    budgetId: budget.id,
    numero,
    nome: firstItem[0]?.nome ? `Projeto — ${firstItem[0].nome}` : `Projeto referente a ${budget.numero}`,
    descricao: budget.objeto || null,
    status: "Planejamento",
    progresso: 0,
    prioridade: "Média",
    prazo: budget.prazoExecucao || null,
  });

  await db.insert(clientHistoryEvents).values({
    id: randomUUID(),
    clientId: budget.clientId,
    description: `Projeto ${numero} criado a partir do orçamento ${budget.numero}`,
  });

  await logActivity({
    companyId: user.companyId,
    userId: user.id,
    userName: user.name,
    action: `converteu o orçamento ${budget.numero} no projeto ${numero}`,
    entityType: "projeto",
    entityId: projectId,
  });

  return NextResponse.json({ ok: true, id: projectId });
}
