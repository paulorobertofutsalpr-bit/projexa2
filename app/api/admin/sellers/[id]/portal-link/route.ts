import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { db } from "@/db";
import { sellers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || !user.isSuperAdmin) {
    return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  }
  const { id } = await params;

  const rows = await db.select().from(sellers).where(eq(sellers.id, id));
  const seller = rows[0];
  if (!seller) return NextResponse.json({ error: "Vendedor não encontrado." }, { status: 404 });

  let token = seller.portalToken;
  if (!token) {
    token = randomBytes(20).toString("hex");
    await db.update(sellers).set({ portalToken: token }).where(eq(sellers.id, id));
  }

  return NextResponse.json({ ok: true, token });
}
