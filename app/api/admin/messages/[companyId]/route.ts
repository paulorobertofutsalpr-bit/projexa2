import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { db } from "@/db";
import { messages } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: NextRequest, { params }: { params: Promise<{ companyId: string }> }) {
  const user = await getCurrentUser();
  if (!user || !user.isSuperAdmin) {
    return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  }
  const { companyId } = await params;

  const rows = await db.select().from(messages).where(eq(messages.companyId, companyId)).orderBy(messages.createdAt);

  await db
    .update(messages)
    .set({ readAt: new Date() })
    .where(and(eq(messages.companyId, companyId), eq(messages.fromSuperAdmin, false)));

  return NextResponse.json({ messages: rows });
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ companyId: string }> }) {
  const user = await getCurrentUser();
  if (!user || !user.isSuperAdmin) {
    return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  }
  const { companyId } = await params;

  const body = await request.json().catch(() => null);
  const text = body?.body?.trim();
  if (!text) {
    return NextResponse.json({ error: "Escreva uma mensagem." }, { status: 400 });
  }

  const row = {
    id: randomUUID(),
    companyId,
    senderId: user.id,
    senderName: user.name,
    fromSuperAdmin: true,
    body: text,
  };

  await db.insert(messages).values(row);

  return NextResponse.json({ ok: true, message: row });
}
