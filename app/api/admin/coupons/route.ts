import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { db } from "@/db";
import { discountCodes } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";

const VALID_KINDS = ["percent", "fixed", "free", "lifetime"];

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  if (!user.isSuperAdmin) return NextResponse.json({ error: "Acesso restrito." }, { status: 403 });

  const rows = await db.select().from(discountCodes).orderBy(desc(discountCodes.createdAt));
  return NextResponse.json({ coupons: rows });
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  if (!user.isSuperAdmin) return NextResponse.json({ error: "Acesso restrito." }, { status: 403 });

  const body = await request.json().catch(() => null);
  const code = body?.code?.trim().toUpperCase();
  const kind = body?.kind;
  const value = Number(body?.value ?? 0);
  const maxUses = body?.maxUses ? Number(body.maxUses) : null;
  const expiresAt = body?.expiresAt ? new Date(body.expiresAt) : null;

  if (!code) return NextResponse.json({ error: "Informe um código." }, { status: 400 });
  if (!VALID_KINDS.includes(kind)) return NextResponse.json({ error: "Tipo de cupom inválido." }, { status: 400 });
  if (kind === "percent" && (value <= 0 || value > 100)) {
    return NextResponse.json({ error: "Percentual deve ser entre 1 e 100." }, { status: 400 });
  }
  if (kind === "fixed" && value <= 0) {
    return NextResponse.json({ error: "Valor fixo deve ser maior que zero." }, { status: 400 });
  }

  const existing = await db.select().from(discountCodes).where(eq(discountCodes.code, code));
  if (existing[0]) {
    return NextResponse.json({ error: "Já existe um cupom com esse código." }, { status: 409 });
  }

  await db.insert(discountCodes).values({
    id: randomUUID(),
    code,
    kind,
    value: Number.isFinite(value) ? Math.round(value) : 0,
    maxUses,
    active: true,
    expiresAt,
  });

  return NextResponse.json({ ok: true });
}
