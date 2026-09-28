import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { getCurrentUser, hashPassword } from "@/lib/auth";
import { logActivity } from "@/lib/activity";
import { randomUUID } from "crypto";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const rows = await db
    .select({ id: users.id, name: users.name, email: users.email, role: users.role, createdAt: users.createdAt })
    .from(users)
    .where(eq(users.companyId, user.companyId));

  return NextResponse.json({ users: rows });
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  if (user.role !== "ADMIN") {
    return NextResponse.json({ error: "Só administradores podem cadastrar usuários." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  if (!body?.name?.trim() || !body?.email?.trim() || !body?.password) {
    return NextResponse.json({ error: "Preencha nome, e-mail e senha." }, { status: 400 });
  }

  const existing = await db.select().from(users).where(eq(users.email, body.email.trim().toLowerCase()));
  if (existing[0]) {
    return NextResponse.json({ error: "Já existe um usuário com este e-mail." }, { status: 400 });
  }

  const id = randomUUID();
  const passwordHash = await hashPassword(body.password);
  await db.insert(users).values({
    id,
    name: body.name.trim(),
    email: body.email.trim().toLowerCase(),
    passwordHash,
    role: body.role === "ADMIN" ? "ADMIN" : "USUARIO",
    companyId: user.companyId,
  });

  await logActivity({
    companyId: user.companyId,
    userId: user.id,
    userName: user.name,
    action: `cadastrou o usuário ${body.name.trim()}`,
    entityType: "usuario",
    entityId: id,
  });

  return NextResponse.json({ ok: true, id });
}
