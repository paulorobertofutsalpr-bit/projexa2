import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { budgets, clientHistoryEvents } from "@/db/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

export async function POST(request: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const rows = await db.select().from(budgets).where(eq(budgets.publicToken, token));
  const budget = rows[0];
  if (!budget) return NextResponse.json({ error: "Proposta não encontrada." }, { status: 404 });
  if (budget.status !== "Enviado") {
    return NextResponse.json({ error: "Esta proposta não está mais disponível para aprovação." }, { status: 400 });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "desconhecido";

  await db
    .update(budgets)
    .set({ status: "Aprovado", approvedAt: new Date(), approvedIp: ip })
    .where(eq(budgets.id, budget.id));

  await db.insert(clientHistoryEvents).values({
    id: randomUUID(),
    clientId: budget.clientId,
    description: `Proposta ${budget.numero} aprovada pelo cliente`,
  });

  return NextResponse.json({ ok: true });
}
