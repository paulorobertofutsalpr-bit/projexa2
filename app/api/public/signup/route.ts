import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { db } from "@/db";
import { companies, users, sellers, discountCodes } from "@/db/schema";
import { and, eq, gt, isNull, or, sql } from "drizzle-orm";
import { hashPassword, createSession } from "@/lib/auth";

const DEFAULT_PRICE_CENTS = 3900;

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);

  const companyName = body?.companyName?.trim();
  const adminName = body?.adminName?.trim();
  const email = body?.email?.trim().toLowerCase();
  const password = body?.password;
  const phone = body?.phone?.trim() || null;
  const referralCode = body?.code?.trim().toUpperCase() || null;

  if (!companyName || !adminName || !email || !password) {
    return NextResponse.json(
      { error: "Preencha nome da empresa, seu nome, e-mail e senha." },
      { status: 400 }
    );
  }

  if (password.length < 6) {
    return NextResponse.json(
      { error: "A senha deve ter pelo menos 6 caracteres." },
      { status: 400 }
    );
  }

  const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, email));
  if (existing[0]) {
    return NextResponse.json(
      { error: "Já existe uma conta cadastrada com este e-mail." },
      { status: 409 }
    );
  }

  // Resolve código opcional: primeiro tenta como código de vendedor, depois como cupom de desconto.
  let sellerId: string | null = null;
  let discountCodeId: string | null = null;
  let subscriptionPriceCents = DEFAULT_PRICE_CENTS;
  let lifetimeAccess = false;
  let initialStatus = "trial";

  if (referralCode) {
    const sellerRows = await db
      .select()
      .from(sellers)
      .where(and(eq(sellers.code, referralCode), eq(sellers.active, true)));

    if (sellerRows[0]) {
      sellerId = sellerRows[0].id;
    } else {
      const couponRows = await db
        .select()
        .from(discountCodes)
        .where(
          and(
            eq(discountCodes.code, referralCode),
            eq(discountCodes.active, true),
            or(isNull(discountCodes.expiresAt), gt(discountCodes.expiresAt, new Date()))
          )
        );
      const coupon = couponRows[0];

      if (!coupon) {
        return NextResponse.json({ error: "Código inválido ou expirado." }, { status: 400 });
      }
      if (coupon.maxUses !== null && coupon.usesCount >= coupon.maxUses) {
        return NextResponse.json({ error: "Este cupom já atingiu o limite de usos." }, { status: 400 });
      }

      discountCodeId = coupon.id;
      if (coupon.kind === "percent") {
        subscriptionPriceCents = Math.round(DEFAULT_PRICE_CENTS * (1 - coupon.value / 100));
      } else if (coupon.kind === "fixed") {
        subscriptionPriceCents = Math.max(0, DEFAULT_PRICE_CENTS - coupon.value);
      } else if (coupon.kind === "free") {
        subscriptionPriceCents = 0;
        initialStatus = "active";
      } else if (coupon.kind === "lifetime") {
        lifetimeAccess = true;
        initialStatus = "active";
      }

      await db
        .update(discountCodes)
        .set({ usesCount: sql`${discountCodes.usesCount} + 1` })
        .where(eq(discountCodes.id, coupon.id));
    }
  }

  const companyId = randomUUID();
  const userId = randomUUID();
  const passwordHash = await hashPassword(password);

  await db.insert(companies).values({
    id: companyId,
    name: companyName,
    email,
    phone,
    subscriptionStatus: initialStatus,
    subscriptionPriceCents,
    lifetimeAccess,
    sellerId,
    discountCodeId,
  });

  await db.insert(users).values({
    id: userId,
    name: adminName,
    email,
    passwordHash,
    role: "ADMIN",
    isSuperAdmin: false,
    companyId,
  });

  await createSession(userId);

  return NextResponse.json({ ok: true });
}
