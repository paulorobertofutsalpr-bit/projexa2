import { NextResponse } from "next/server";
import { db } from "@/db";
import { users, companies } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  if (!user.isSuperAdmin) return NextResponse.json({ error: "Acesso restrito." }, { status: 403 });

  const rows = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      isSuperAdmin: users.isSuperAdmin,
      companyName: companies.name,
      createdAt: users.createdAt,
    })
    .from(users)
    .innerJoin(companies, eq(users.companyId, companies.id))
    .orderBy(desc(users.createdAt));

  return NextResponse.json({ users: rows });
}
