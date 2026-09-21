import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { financialEntries } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { randomUUID } from "crypto";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const rows = await db.select().from(financialEntries).where(eq(financialEntries.companyId, user.companyId));
  return NextResponse.json({ entries: rows });
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const body = await request.json().catch(() => null);
  if (!body?.descricao?.trim() || !body?.valor || !body?.vencimento || !["receita", "despesa"].includes(body?.tipo)) {
    return NextResponse.json({ error: "Preencha descrição, valor, vencimento e tipo." }, { status: 400 });
  }

  const id = randomUUID();
  await db.insert(financialEntries).values({
    id,
    companyId: user.companyId,
    clientId: body.clientId || null,
    projectId: body.projectId || null,
    tipo: body.tipo,
    descricao: body.descricao.trim(),
    categoria: body.categoria || "Outros",
    valor: Math.round(Number(body.valor) * 100),
    vencimento: body.vencimento,
    status: "Pendente",
    formaPagamento: body.formaPagamento || null,
  });

  return NextResponse.json({ ok: true, id });
}
