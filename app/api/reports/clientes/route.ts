import { NextResponse } from "next/server";
import { db } from "@/db";
import { clients } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { toCsv } from "@/lib/csv";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const rows = await db.select().from(clients).where(eq(clients.companyId, user.companyId));
  const csv = toCsv(
    ["Nome", "Tipo", "Documento", "Telefone", "E-mail", "Cidade", "Estado"],
    rows.map((c) => [c.nome, c.tipo, c.documento || "", c.telefone || "", c.email || "", c.cidade || "", c.estado || ""])
  );

  return new NextResponse(csv, {
    headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": 'attachment; filename="clientes.csv"' },
  });
}
