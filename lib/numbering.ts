import { db } from "@/db";
import { numberingSequences } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { randomUUID } from "crypto";

const DEFAULT_PREFIXES: Record<string, string> = {
  orcamento: "ORC",
  projeto: "PROJ",
  contrato: "CONT",
};

export async function getNextNumber(companyId: string, tipo: "orcamento" | "projeto" | "contrato") {
  const ano = new Date().getFullYear();

  const existing = await db
    .select()
    .from(numberingSequences)
    .where(and(eq(numberingSequences.companyId, companyId), eq(numberingSequences.tipo, tipo), eq(numberingSequences.ano, ano)));

  if (existing[0]) {
    const next = existing[0].ultimoNumero + 1;
    await db
      .update(numberingSequences)
      .set({ ultimoNumero: next })
      .where(eq(numberingSequences.id, existing[0].id));
    return `${existing[0].prefixo}-${ano}-${String(next).padStart(4, "0")}`;
  }

  const prefixo = DEFAULT_PREFIXES[tipo];
  await db.insert(numberingSequences).values({
    id: randomUUID(),
    companyId,
    tipo,
    ano,
    prefixo,
    ultimoNumero: 1,
  });
  return `${prefixo}-${ano}-0001`;
}
