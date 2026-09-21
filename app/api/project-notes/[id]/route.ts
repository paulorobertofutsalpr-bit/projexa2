import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { projectNotes, projects } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";

async function getNoteIfAllowed(noteId: string, companyId: string) {
  const rows = await db
    .select({ note: projectNotes, projectCompanyId: projects.companyId })
    .from(projectNotes)
    .innerJoin(projects, eq(projectNotes.projectId, projects.id))
    .where(and(eq(projectNotes.id, noteId), eq(projects.companyId, companyId)));
  return rows[0]?.note || null;
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const { id } = await params;
  const note = await getNoteIfAllowed(id, user.companyId);
  if (!note) return NextResponse.json({ error: "Registro não encontrado." }, { status: 404 });

  if (note.userId !== user.id && user.role !== "ADMIN") {
    return NextResponse.json({ error: "Só quem escreveu ou um administrador pode editar." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  if (!body?.texto?.trim()) {
    return NextResponse.json({ error: "Escreva algo antes de salvar." }, { status: 400 });
  }

  await db.update(projectNotes).set({ texto: body.texto.trim(), editedAt: new Date() }).where(eq(projectNotes.id, id));
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const { id } = await params;
  const note = await getNoteIfAllowed(id, user.companyId);
  if (!note) return NextResponse.json({ error: "Registro não encontrado." }, { status: 404 });

  if (note.userId !== user.id && user.role !== "ADMIN") {
    return NextResponse.json({ error: "Só quem escreveu ou um administrador pode excluir." }, { status: 403 });
  }

  await db.delete(projectNotes).where(eq(projectNotes.id, id));
  return NextResponse.json({ ok: true });
}
