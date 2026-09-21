import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { contracts, clientHistoryEvents } from "@/db/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

export async function POST(request: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const body = await request.json().catch(() => null);
  const nome = body?.nome?.trim();
  const cpf = body?.cpf?.trim();

  if (!nome || !cpf) {
    return NextResponse.json({ error: "Informe nome completo e CPF/CNPJ." }, { status: 400 });
  }

  const rows = await db.select().from(contracts).where(eq(contracts.publicToken, token));
  const contract = rows[0];
  if (!contract) return NextResponse.json({ error: "Contrato não encontrado." }, { status: 404 });
  if (contract.status === "Assinado") {
    return NextResponse.json({ error: "Este contrato já foi assinado." }, { status: 400 });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "desconhecido";

  await db
    .update(contracts)
    .set({
      status: "Assinado",
      assinadoNome: nome,
      assinadoCpf: cpf,
      assinadoIp: ip,
      assinadoEm: new Date(),
    })
    .where(eq(contracts.id, contract.id));

  await db.insert(clientHistoryEvents).values({
    id: randomUUID(),
    clientId: contract.clientId,
    description: `Contrato ${contract.numero} assinado eletronicamente por ${nome}`,
  });

  return NextResponse.json({ ok: true });
}
