import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { financialEntries } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { logActivity } from "@/lib/activity";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const dataPagamento = body?.dataPagamento || new Date().toISOString().slice(0, 10);

  const rows = await db
    .select()
    .from(financialEntries)
    .where(and(eq(financialEntries.id, id), eq(financialEntries.companyId, user.companyId)));
  const entry = rows[0];
  if (!entry) return NextResponse.json({ error: "Lançamento não encontrado." }, { status: 404 });

  await db
    .update(financialEntries)
    .set({ status: "Pago", dataPagamento, formaPagamento: body?.formaPagamento || undefined })
    .where(and(eq(financialEntries.id, id), eq(financialEntries.companyId, user.companyId)));

  await logActivity({
    companyId: user.companyId,
    userId: user.id,
    userName: user.name,
    action: `deu baixa no lançamento "${entry.descricao}"`,
    entityType: "financeiro",
    entityId: id,
  });

  return NextResponse.json({ ok: true });
}
