import { NextResponse } from "next/server";
import { db } from "@/db";
import { companies } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rows = await db.select().from(companies);
    return NextResponse.json({ status: "ok", db: true, companies: rows.length });
  } catch (err) {
    return NextResponse.json(
      { status: "error", db: false, message: err instanceof Error ? err.message : "erro" },
      { status: 500 }
    );
  }
}
