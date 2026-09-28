import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { db } from "@/db";
import { sellers, companies } from "@/db/schema";
import { desc, eq, sql } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  if (!user.isSuperAdmin) return NextResponse.json({ error: "Acesso restrito." }, { status: 403 });

  const rows = await db
    .select({
      id: sellers.id,
      name: sellers.name,
      email: sellers.email,
      code: sellers.code,
      commissionPercent: sellers.commissionPercent,
      active: sellers.active,
      createdAt: sellers.createdAt,
      referredCount: sql<number>`(select count(*)::int from "companies" where "companies"."seller_id" = "sellers"."id")`,
      referredMrrCents: sql<number>`(select coalesce(sum("companies"."subscription_price_cents"), 0)::int from "companies" where "companies"."seller_id" = "sellers"."id" and "companies"."subscription_status" = 'active' and "companies"."lifetime_access" = false)`,
    })
    .from(sellers)
    .orderBy(desc(sellers.createdAt));

  const withCommission = rows.map((r) => ({
    ...r,
    commissionCents: Math.round((r.referredMrrCents * r.commissionPercent) / 100),
  }));

  return NextResponse.json({ sellers: withCommission });
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  if (!user.isSuperAdmin) return NextResponse.json({ error: "Acesso restrito." }, { status: 403 });

  const body = await request.json().catch(() => null);
  const name = body?.name?.trim();
  const email = body?.email?.trim() || null;
  const code = body?.code?.trim().toUpperCase();
  const commissionPercent = Number(body?.commissionPercent ?? 10);

  if (!name || !code) {
    return NextResponse.json({ error: "Informe nome e código do vendedor." }, { status: 400 });
  }
  if (!Number.isFinite(commissionPercent) || commissionPercent < 0 || commissionPercent > 100) {
    return NextResponse.json({ error: "Comissão deve ser entre 0 e 100." }, { status: 400 });
  }

  const existing = await db.select().from(sellers).where(eq(sellers.code, code));
  if (existing[0]) {
    return NextResponse.json({ error: "Já existe um vendedor com esse código." }, { status: 409 });
  }

  await db.insert(sellers).values({
    id: randomUUID(),
    name,
    email,
    code,
    commissionPercent: Math.round(commissionPercent),
    active: true,
  });

  return NextResponse.json({ ok: true });
}
