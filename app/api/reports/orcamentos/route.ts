import { NextResponse } from "next/server";
import { db } from "@/db";
import { budgets, clients } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { toCsv } from "@/lib/csv";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const rows = await db
    .select({
      numero: budgets.numero,
      clientName: clients.nome,
      status: budgets.status,
      total: budgets.total,
      createdAt: budgets.createdAt,
    })
    .from(budgets)
    .innerJoin(clients, eq(budgets.clientId, clients.id))
    .where(eq(budgets.companyId, user.companyId));

  const csv = toCsv(
    ["Número", "Cliente", "Status", "Valor (R$)", "Data"],
    rows.map((b) => [b.numero, b.clientName, b.status, (b.total / 100).toFixed(2), new Date(b.createdAt).toLocaleDateString("pt-BR")])
  );

  return new NextResponse(csv, {
    headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": 'attachment; filename="orcamentos.csv"' },
  });
}
