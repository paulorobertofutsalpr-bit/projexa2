import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { documents } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const rows = await db
    .select()
    .from(documents)
    .where(and(eq(documents.id, id), eq(documents.visivelCliente, true)));
  const doc = rows[0];
  if (!doc) return NextResponse.json({ error: "Documento não encontrado ou não liberado." }, { status: 404 });

  const base64Payload = doc.conteudo.split(",").pop() || "";
  const buffer = Buffer.from(base64Payload, "base64");

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": doc.tipo,
      "Content-Disposition": `attachment; filename="${encodeURIComponent(doc.nome)}"`,
      "Content-Length": String(buffer.length),
    },
  });
}
