import { NextResponse } from "next/server";
import { db } from "@/db";
import { financialEntries } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { toCsv } from "@/lib/csv";
import { computeDisplayStatus } from "@/lib/finance";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const rows = await db.select().from(financialEntries).where(eq(financialEntries.companyId, user.companyId));

  const csv = toCsv(
    ["Tipo", "Descrição", "Categoria", "Valor (R$)", "Vencimento", "Status", "Data de pagamento"],
    rows.map((f) => [
      f.tipo,
      f.descricao,
      f.categoria,
      (f.valor / 100).toFixed(2),
      f.vencimento,
      computeDisplayStatus(f.status, f.vencimento),
      f.dataPagamento || "",
    ])
  );

  return new NextResponse(csv, {
    headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": 'attachment; filename="financeiro.csv"' },
  });
}
