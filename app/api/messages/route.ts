import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { db } from "@/db";
import { messages } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const rows = await db
    .select()
    .from(messages)
    .where(eq(messages.companyId, user.companyId))
    .orderBy(messages.createdAt);

  // Marca como lidas as mensagens do administrador do sistema que o usuário está vendo agora.
  await db
    .update(messages)
    .set({ readAt: new Date() })
    .where(and(eq(messages.companyId, user.companyId), eq(messages.fromSuperAdmin, true)));

  return NextResponse.json({ messages: rows });
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const body = await request.json().catch(() => null);
  const text = body?.body?.trim();
  if (!text) {
    return NextResponse.json({ error: "Escreva uma mensagem." }, { status: 400 });
  }

  const row = {
    id: randomUUID(),
    companyId: user.companyId,
    senderId: user.id,
    senderName: user.name,
    fromSuperAdmin: false,
    body: text,
  };

  await db.insert(messages).values(row);

  return NextResponse.json({ ok: true, message: row });
}
