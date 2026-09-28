import { NextResponse } from "next/server";
import { db } from "@/db";
import { companies } from "@/db/schema";

export async function GET() {
  const rows = await db.select({ name: companies.name, logoData: companies.logoData }).from(companies).limit(1);
  return NextResponse.json({ company: rows[0] || null });
}
