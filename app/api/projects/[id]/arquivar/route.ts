import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { projects } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { logActivity } from "@/lib/activity";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const { id } = await params;
  const rows = await db
    .select()
    .from(projects)
    .where(and(eq(projects.id, id), eq(projects.companyId, user.companyId)));
  const project = rows[0];
  if (!project) return NextResponse.json({ error: "Projeto não encontrado." }, { status: 404 });

  await db.update(projects).set({ arquivadoEm: new Date() }).where(eq(projects.id, id));

  await logActivity({
    companyId: user.companyId,
    userId: user.id,
    userName: user.name,
    action: `arquivou o projeto ${project.numero}`,
    entityType: "projeto",
    entityId: id,
  });

  return NextResponse.json({ ok: true });
}
