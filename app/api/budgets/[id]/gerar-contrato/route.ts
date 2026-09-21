import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { budgets, contracts, clientHistoryEvents } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { logActivity } from "@/lib/activity";
import { getNextNumber } from "@/lib/numbering";
import { randomUUID, randomBytes } from "crypto";

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
    return NextResponse.json({ error: "Só é possível gerar contrato de orçamentos aprovados." }, { status: 400 });
  }

  const existing = await db.select().from(contracts).where(eq(contracts.budgetId, id));
  if (existing[0]) {
    return NextResponse.json({ ok: true, id: existing[0].id, alreadyExisted: true });
  }

  const contractId = randomUUID();
  const numero = await getNextNumber(user.companyId, "contrato");
  const publicToken = randomBytes(16).toString("hex");

  await db.insert(contracts).values({
    id: contractId,
    companyId: user.companyId,
    clientId: budget.clientId,
    budgetId: budget.id,
    numero,
    objeto: budget.objeto,
    valor: budget.total,
    condicaoPagamento: budget.condicaoPagamento,
    prazoExecucao: budget.prazoExecucao,
    clausulas:
      "O CONTRATADO se compromete a prestar os serviços descritos no objeto deste contrato, com a qualidade técnica e nos prazos aqui estabelecidos. O CONTRATANTE se compromete a fornecer as informações e documentos necessários para a boa execução dos serviços, bem como a efetuar os pagamentos nas condições acordadas. Este contrato passa a ter validade a partir da assinatura eletrônica de ambas as partes.",
    status: "Enviado",
    publicToken,
  });

  await db.insert(clientHistoryEvents).values({
    id: randomUUID(),
    clientId: budget.clientId,
    description: `Contrato ${numero} gerado a partir do orçamento ${budget.numero}`,
  });

  await logActivity({
    companyId: user.companyId,
    userId: user.id,
    userName: user.name,
    action: `gerou o contrato ${numero} a partir do orçamento ${budget.numero}`,
    entityType: "contrato",
    entityId: contractId,
  });

  return NextResponse.json({ ok: true, id: contractId });
}
