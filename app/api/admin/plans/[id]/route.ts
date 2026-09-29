import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { plans } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || !user.isSuperAdmin) {
    return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  }
  const { id } = await params;
  const body = await request.json().catch(() => null);

  const update: Record<string, unknown> = {};
  if (body?.name !== undefined) {
    const name = body.name?.trim();
    if (!name) return NextResponse.json({ error: "Nome inválido." }, { status: 400 });
    update.name = name;
  }
  if (body?.description !== undefined) update.description = body.description?.trim() || null;
  if (body?.priceCentsMonthly !== undefined) update.priceCentsMonthly = Math.max(0, Math.round(Number(body.priceCentsMonthly) || 0));
  if (body?.priceCentsAnnual !== undefined) update.priceCentsAnnual = Math.max(0, Math.round(Number(body.priceCentsAnnual) || 0));
  if (body?.features !== undefined) {
    update.features = Array.isArray(body.features) ? body.features.join("\n") : body.features?.trim() || "";
  }
  if (body?.active !== undefined) update.active = !!body.active;
  if (body?.sortOrder !== undefined) update.sortOrder = Math.round(Number(body.sortOrder) || 0);

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "Nada para atualizar." }, { status: 400 });
  }

  await db.update(plans).set(update).where(eq(plans.id, id));

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || !user.isSuperAdmin) {
    return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  }
  const { id } = await params;
  await db.delete(plans).where(eq(plans.id, id));
  return NextResponse.json({ ok: true });
}
