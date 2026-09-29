import { NextResponse } from "next/server";
import { db } from "@/db";
import { companies } from "@/db/schema";
import { sql } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || !user.isSuperAdmin) {
    return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  }

  const rows = await db
    .select({
      id: companies.id,
      name: companies.name,
      lastMessageAt: sql<string | null>`(select max("messages"."created_at") from "messages" where "messages"."company_id" = "companies"."id")`,
      lastMessageBody: sql<string | null>`(select "messages"."body" from "messages" where "messages"."company_id" = "companies"."id" order by "messages"."created_at" desc limit 1)`,
      unreadCount: sql<number>`(select count(*)::int from "messages" where "messages"."company_id" = "companies"."id" and "messages"."from_super_admin" = false and "messages"."read_at" is null)`,
    })
    .from(companies);

  const withMessages = rows
    .filter((r) => r.lastMessageAt !== null)
    .sort((a, b) => new Date(b.lastMessageAt as string).getTime() - new Date(a.lastMessageAt as string).getTime());

  return NextResponse.json({ companies: withMessages });
}
