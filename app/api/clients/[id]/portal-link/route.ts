import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { clients } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { randomBytes } from "crypto";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const { id } = await params;
  const rows = await db
    .select()
    .from(clients)
    .where(and(eq(clients.id, id), eq(clients.companyId, user.companyId)));
  const client = rows[0];
  if (!client) return NextResponse.json({ error: "Cliente não encontrado." }, { status: 404 });

  let token = client.portalToken;
  if (!token) {
    token = randomBytes(16).toString("hex");
    await db.update(clients).set({ portalToken: token }).where(eq(clients.id, id));
  }

  return NextResponse.json({ ok: true, token });
}
