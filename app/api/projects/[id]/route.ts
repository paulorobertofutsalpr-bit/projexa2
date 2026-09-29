import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { projects } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { logActivity } from "@/lib/activity";

const VALID_PRIORIDADES = ["Baixa", "Média", "Alta"];

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const { id } = await params;
  const body = await request.json().catch(() => null);

  const rows = await db
    .select()
    .from(projects)
    .where(and(eq(projects.id, id), eq(projects.companyId, user.companyId)));
  const project = rows[0];
  if (!project) return NextResponse.json({ error: "Projeto não encontrado." }, { status: 404 });

  const update: Record<string, unknown> = {};

  if (body?.nome !== undefined) {
    const nome = body.nome?.trim();
    if (!nome) return NextResponse.json({ error: "Nome inválido." }, { status: 400 });
    update.nome = nome;
  }
  if (body?.descricao !== undefined) update.descricao = body.descricao?.trim() || null;
  if (body?.prazo !== undefined) update.prazo = body.prazo?.trim() || null;
  if (body?.prioridade !== undefined) {
    if (!VALID_PRIORIDADES.includes(body.prioridade)) {
      return NextResponse.json({ error: "Prioridade inválida." }, { status: 400 });
    }
    update.prioridade = body.prioridade;
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "Nada para atualizar." }, { status: 400 });
  }

  await db.update(projects).set(update).where(and(eq(projects.id, id), eq(projects.companyId, user.companyId)));

  if (update.prazo !== undefined) {
    await logActivity({
      companyId: user.companyId,
      userId: user.id,
      userName: user.name,
      action: `atualizou o prazo do projeto ${project.numero}`,
      entityType: "projeto",
      entityId: id,
    });
  }

  return NextResponse.json({ ok: true });
}
