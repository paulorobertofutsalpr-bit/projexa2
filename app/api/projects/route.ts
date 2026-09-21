import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { projects } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { getNextNumber } from "@/lib/numbering";
import { randomUUID } from "crypto";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const rows = await db.select().from(projects).where(eq(projects.companyId, user.companyId));
  return NextResponse.json({ projects: rows });
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const body = await request.json().catch(() => null);
  if (!body?.clientId || !body?.nome?.trim()) {
    return NextResponse.json({ error: "Cliente e nome do projeto são obrigatórios." }, { status: 400 });
  }

  const id = randomUUID();
  const numero = await getNextNumber(user.companyId, "projeto");

  await db.insert(projects).values({
    id,
    companyId: user.companyId,
    clientId: body.clientId,
    budgetId: body.budgetId || null,
    numero,
    nome: body.nome.trim(),
    descricao: body.descricao || null,
    status: "Planejamento",
    progresso: 0,
    prioridade: body.prioridade || "Média",
    prazo: body.prazo || null,
  });

  return NextResponse.json({ ok: true, id });
}
