import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { companies } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const rows = await db.select().from(companies).where(eq(companies.id, user.companyId));
  return NextResponse.json({ company: rows[0] });
}

export async function PUT(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const body = await request.json().catch(() => null);
  if (!body?.name?.trim()) {
    return NextResponse.json({ error: "Nome da empresa é obrigatório." }, { status: 400 });
  }

  const update: Record<string, string | null> = {
    name: body.name.trim(),
    document: body.document || null,
    phone: body.phone || null,
    email: body.email || null,
    address: body.address || null,
    city: body.city || null,
    state: body.state || null,
    website: body.website || null,
  };

  if (typeof body.logoData === "string") {
    update.logoData = body.logoData || null;
  }

  await db.update(companies).set(update).where(eq(companies.id, user.companyId));

  return NextResponse.json({ ok: true });
}
