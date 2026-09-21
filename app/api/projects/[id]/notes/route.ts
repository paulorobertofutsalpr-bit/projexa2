import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { projectNotes, projects } from "@/db/schema";
import { and, desc, eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { randomUUID } from "crypto";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const { id } = await params;
  const rows = await db
    .select()
    .from(projectNotes)
    .where(eq(projectNotes.projectId, id))
    .orderBy(desc(projectNotes.createdAt));

  return NextResponse.json({ notes: rows });
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const { id } = await params;
  const projectRows = await db
    .select()
    .from(projects)
    .where(and(eq(projects.id, id), eq(projects.companyId, user.companyId)));
  if (!projectRows[0]) return NextResponse.json({ error: "Projeto não encontrado." }, { status: 404 });

  const body = await request.json().catch(() => null);
  if (!body?.texto?.trim()) {
    return NextResponse.json({ error: "Escreva algo antes de salvar." }, { status: 400 });
  }

  const noteId = randomUUID();
  await db.insert(projectNotes).values({
    id: noteId,
    projectId: id,
    userId: user.id,
    userName: user.name,
    texto: body.texto.trim(),
  });

  return NextResponse.json({ ok: true, id: noteId });
}
