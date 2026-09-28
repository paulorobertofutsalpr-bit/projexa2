import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { projects } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { getNextNumber } from "@/lib/numbering";
import { logActivity } from "@/lib/activity";
import { randomUUID } from "crypto";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const { id } = await params;
  const rows = await db
    .select()
    .from(projects)
    .where(and(eq(projects.id, id), eq(projects.companyId, user.companyId)));
  const original = rows[0];
  if (!original) return NextResponse.json({ error: "Projeto não encontrado." }, { status: 404 });

  const newId = randomUUID();
  const numero = await getNextNumber(user.companyId, "projeto");

  await db.insert(projects).values({
    id: newId,
    companyId: user.companyId,
    clientId: original.clientId,
    budgetId: null,
    numero,
    nome: `${original.nome} (cópia)`,
    descricao: original.descricao,
    status: "Planejamento",
    progresso: 0,
    prioridade: original.prioridade,
    prazo: null,
  });

  await logActivity({
    companyId: user.companyId,
    userId: user.id,
    userName: user.name,
    action: `duplicou o projeto ${original.numero} como ${numero}`,
    entityType: "projeto",
    entityId: newId,
  });

  return NextResponse.json({ ok: true, id: newId });
}
