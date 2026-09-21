import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { clients, budgets, projects } from "@/db/schema";
import { and, eq, ilike, or } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const q = request.nextUrl.searchParams.get("q")?.trim() || "";
  if (q.length < 2) return NextResponse.json({ clients: [], budgets: [], projects: [] });

  const like = `%${q}%`;

  const [clientResults, budgetResults, projectResults] = await Promise.all([
    db
      .select({ id: clients.id, nome: clients.nome, documento: clients.documento })
      .from(clients)
      .where(and(eq(clients.companyId, user.companyId), or(ilike(clients.nome, like), ilike(clients.documento, like))))
      .limit(5),
    db
      .select({ id: budgets.id, numero: budgets.numero })
      .from(budgets)
      .where(and(eq(budgets.companyId, user.companyId), ilike(budgets.numero, like)))
      .limit(5),
    db
      .select({ id: projects.id, numero: projects.numero, nome: projects.nome })
      .from(projects)
      .where(and(eq(projects.companyId, user.companyId), or(ilike(projects.nome, like), ilike(projects.numero, like))))
      .limit(5),
  ]);

  return NextResponse.json({ clients: clientResults, budgets: budgetResults, projects: projectResults });
}
