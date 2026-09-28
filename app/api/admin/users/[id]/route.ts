import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  if (!user.isSuperAdmin) return NextResponse.json({ error: "Acesso restrito." }, { status: 403 });

  const { id } = await params;
  const body = await request.json().catch(() => null);

  if (typeof body?.isSuperAdmin !== "boolean") {
    return NextResponse.json({ error: "Nada para atualizar." }, { status: 400 });
  }

  if (id === user.id && body.isSuperAdmin === false) {
    return NextResponse.json({ error: "Você não pode remover seu próprio acesso de administrador do sistema." }, { status: 400 });
  }

  await db.update(users).set({ isSuperAdmin: body.isSuperAdmin }).where(eq(users.id, id));
  return NextResponse.json({ ok: true });
}
