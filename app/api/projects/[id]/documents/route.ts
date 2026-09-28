import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { documents, projects } from "@/db/schema";
import { and, desc, eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { randomUUID } from "crypto";

const MAX_SIZE_BYTES = 4 * 1024 * 1024; // 4MB

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const { id } = await params;
  const rows = await db
    .select({
      id: documents.id,
      groupId: documents.groupId,
      categoria: documents.categoria,
      nome: documents.nome,
      tipo: documents.tipo,
      tamanho: documents.tamanho,
      versao: documents.versao,
      visivelCliente: documents.visivelCliente,
      createdAt: documents.createdAt,
    })
    .from(documents)
    .where(and(eq(documents.projectId, id), eq(documents.companyId, user.companyId)))
    .orderBy(desc(documents.versao));

  return NextResponse.json({ documents: rows });
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
  const { nome, tipo, conteudo, categoria, groupId: existingGroupId, visivelCliente } = body || {};

  if (!nome || !tipo || !conteudo) {
    return NextResponse.json({ error: "Arquivo inválido." }, { status: 400 });
  }

  const base64Payload = String(conteudo).split(",").pop() || "";
  const tamanho = Math.floor((base64Payload.length * 3) / 4);
  if (tamanho > MAX_SIZE_BYTES) {
    return NextResponse.json({ error: "Arquivo maior que 4MB. Escolha um arquivo menor." }, { status: 400 });
  }

  let groupId = existingGroupId;
  let versao = 1;

  if (groupId) {
    const previous = await db
      .select()
      .from(documents)
      .where(and(eq(documents.groupId, groupId), eq(documents.projectId, id)))
      .orderBy(desc(documents.versao));
    versao = (previous[0]?.versao || 0) + 1;
  } else {
    groupId = randomUUID();
  }

  const docId = randomUUID();
  await db.insert(documents).values({
    id: docId,
    companyId: user.companyId,
    projectId: id,
    groupId,
    categoria: categoria || "Outros",
    nome,
    tipo,
    tamanho,
    conteudo,
    versao,
    visivelCliente: Boolean(visivelCliente),
  });

  return NextResponse.json({ ok: true, id: docId, groupId, versao });
}
