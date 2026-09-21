import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { clients, clientHistoryEvents } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { logActivity } from "@/lib/activity";
import { randomUUID } from "crypto";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const rows = await db.select().from(clients).where(eq(clients.companyId, user.companyId));
  return NextResponse.json({ clients: rows });
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const body = await request.json().catch(() => null);
  if (!body?.nome?.trim()) {
    return NextResponse.json({ error: "Nome é obrigatório." }, { status: 400 });
  }

  const id = randomUUID();
  await db.insert(clients).values({
    id,
    companyId: user.companyId,
    tipo: body.tipo || "Pessoa Física",
    nome: body.nome.trim(),
    documento: body.documento || null,
    telefone: body.telefone || null,
    email: body.email || null,
    cidade: body.cidade || null,
    estado: body.estado || null,
    endereco: body.endereco || null,
    bairro: body.bairro || null,
    cep: body.cep || null,
    observacoes: body.observacoes || null,
  });

  await db.insert(clientHistoryEvents).values({
    id: randomUUID(),
    clientId: id,
    description: "Cliente cadastrado",
  });

  await logActivity({
    companyId: user.companyId,
    userId: user.id,
    userName: user.name,
    action: `cadastrou o cliente "${body.nome.trim()}"`,
    entityType: "cliente",
    entityId: id,
  });

  return NextResponse.json({ ok: true, id });
}
