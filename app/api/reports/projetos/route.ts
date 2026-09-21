import { NextResponse } from "next/server";
import { db } from "@/db";
import { projects, clients } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { toCsv } from "@/lib/csv";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const rows = await db
    .select({
      numero: projects.numero,
      nome: projects.nome,
      clientName: clients.nome,
      status: projects.status,
      progresso: projects.progresso,
      prazo: projects.prazo,
    })
    .from(projects)
    .innerJoin(clients, eq(projects.clientId, clients.id))
    .where(eq(projects.companyId, user.companyId));

  const csv = toCsv(
    ["Número", "Nome", "Cliente", "Status", "Progresso (%)", "Prazo"],
    rows.map((p) => [p.numero, p.nome, p.clientName, p.status, p.progresso, p.prazo || ""])
  );

  return new NextResponse(csv, {
    headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": 'attachment; filename="projetos.csv"' },
  });
}
