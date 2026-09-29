import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { sellers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { buildSellerReport } from "@/lib/sellerReport";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || !user.isSuperAdmin) {
    return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  }
  const { id } = await params;

  const sellerRows = await db.select().from(sellers).where(eq(sellers.id, id));
  const seller = sellerRows[0];
  if (!seller) return NextResponse.json({ error: "Vendedor não encontrado." }, { status: 404 });

  const { searchParams } = new URL(request.url);
  const month = searchParams.get("month") || new Date().toISOString().slice(0, 7);

  const report = await buildSellerReport(seller, month);
  return NextResponse.json(report);
}
