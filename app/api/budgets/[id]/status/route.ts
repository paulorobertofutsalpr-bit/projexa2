import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { budgets, clientHistoryEvents } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { logActivity } from "@/lib/activity";
import { randomUUID } from "crypto";

const ALLOWED = ["Rascunho", "Enviado", "Aprovado", "Recusado"];

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const status = body?.status;
  if (!ALLOWED.includes(status)) {
    return NextResponse.json({ error: "Status inválido." }, { status: 400 });
  }

  const rows = await db
    .select()
    .from(budgets)
    .where(and(eq(budgets.id, id), eq(budgets.companyId, user.companyId)));
  const budget = rows[0];
  if (!budget) return NextResponse.json({ error: "Orçamento não encontrado." }, { status: 404 });

  await db.update(budgets).set({ status }).where(eq(budgets.id, id));

  await db.insert(clientHistoryEvents).values({
    id: randomUUID(),
    clientId: budget.clientId,
    description: `Orçamento ${budget.numero} marcado como ${status}`,
  });

  await logActivity({
    companyId: user.companyId,
    userId: user.id,
    userName: user.name,
    action: `alterou o status do orçamento ${budget.numero} para ${status}`,
    entityType: "orcamento",
    entityId: id,
  });

  return NextResponse.json({ ok: true });
}
