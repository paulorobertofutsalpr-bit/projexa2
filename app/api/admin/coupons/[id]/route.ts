import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { discountCodes } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  if (!user.isSuperAdmin) return NextResponse.json({ error: "Acesso restrito." }, { status: 403 });

  const { id } = await params;
  const body = await request.json().catch(() => null);

  if (typeof body?.active !== "boolean") {
    return NextResponse.json({ error: "Nada para atualizar." }, { status: 400 });
  }

  await db.update(discountCodes).set({ active: body.active }).where(eq(discountCodes.id, id));
  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  if (!user.isSuperAdmin) return NextResponse.json({ error: "Acesso restrito." }, { status: 403 });

  const { id } = await params;
  await db.delete(discountCodes).where(eq(discountCodes.id, id));
  return NextResponse.json({ ok: true });
}
