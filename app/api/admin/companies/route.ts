import { NextResponse } from "next/server";
import { db } from "@/db";
import { companies } from "@/db/schema";
import { desc, sql } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  if (!user.isSuperAdmin) {
    return NextResponse.json({ error: "Acesso restrito ao administrador do sistema." }, { status: 403 });
  }

  const rows = await db
    .select({
      id: companies.id,
      name: companies.name,
      email: companies.email,
      phone: companies.phone,
      subscriptionStatus: companies.subscriptionStatus,
      subscriptionPriceCents: companies.subscriptionPriceCents,
      subscriptionOverdueSince: companies.subscriptionOverdueSince,
      mpPayerEmail: companies.mpPayerEmail,
      createdAt: companies.createdAt,
      userCount: sql<number>`(select count(*)::int from "users" where "users"."company_id" = "companies"."id")`,
    })
    .from(companies)
    .orderBy(desc(companies.createdAt));

  return NextResponse.json({ companies: rows });
}
