import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { db } from "@/db";
import { plans } from "@/db/schema";
import { asc, sql } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || !user.isSuperAdmin) {
    return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  }

  const rows = await db
    .select({
      id: plans.id,
      name: plans.name,
      description: plans.description,
      priceCentsMonthly: plans.priceCentsMonthly,
      priceCentsAnnual: plans.priceCentsAnnual,
      features: plans.features,
      active: plans.active,
      sortOrder: plans.sortOrder,
      createdAt: plans.createdAt,
      companyCount: sql<number>`(select count(*)::int from "companies" where "companies"."plan_id" = "plans"."id")`,
    })
    .from(plans)
    .orderBy(asc(plans.sortOrder), asc(plans.createdAt));

  return NextResponse.json({ plans: rows });
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user || !user.isSuperAdmin) {
    return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const name = body?.name?.trim();
  if (!name) {
    return NextResponse.json({ error: "Informe o nome do plano." }, { status: 400 });
  }

  const priceCentsMonthly = Math.max(0, Math.round(Number(body?.priceCentsMonthly) || 0));
  const priceCentsAnnual = Math.max(0, Math.round(Number(body?.priceCentsAnnual) || 0));
  const description = body?.description?.trim() || null;
  const features = Array.isArray(body?.features) ? body.features.join("\n") : body?.features?.trim() || "";

  const row = {
    id: randomUUID(),
    name,
    description,
    priceCentsMonthly,
    priceCentsAnnual,
    features,
    active: body?.active !== false,
    sortOrder: Math.round(Number(body?.sortOrder) || 0),
  };

  await db.insert(plans).values(row);

  return NextResponse.json({ ok: true, plan: row });
}
