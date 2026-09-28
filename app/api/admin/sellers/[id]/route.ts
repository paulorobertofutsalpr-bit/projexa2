import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { sellers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  if (!user.isSuperAdmin) return NextResponse.json({ error: "Acesso restrito." }, { status: 403 });

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const update: Record<string, unknown> = {};

  if (typeof body?.active === "boolean") update.active = body.active;
  if (body?.commissionPercent !== undefined) {
    const v = Number(body.commissionPercent);
    if (!Number.isFinite(v) || v < 0 || v > 100) {
      return NextResponse.json({ error: "Comissão deve ser entre 0 e 100." }, { status: 400 });
    }
    update.commissionPercent = Math.round(v);
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "Nada para atualizar." }, { status: 400 });
  }

  await db.update(sellers).set(update).where(eq(sellers.id, id));
  return NextResponse.json({ ok: true });
}
