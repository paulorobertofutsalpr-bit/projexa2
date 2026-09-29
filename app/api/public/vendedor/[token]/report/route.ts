import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { sellers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { buildSellerReport } from "@/lib/sellerReport";

export async function GET(request: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  const rows = await db.select().from(sellers).where(eq(sellers.portalToken, token));
  const seller = rows[0];
  if (!seller) return NextResponse.json({ error: "Link inválido." }, { status: 404 });

  const { searchParams } = new URL(request.url);
  const month = searchParams.get("month") || new Date().toISOString().slice(0, 7);

  const report = await buildSellerReport(seller, month);
  return NextResponse.json(report);
}
