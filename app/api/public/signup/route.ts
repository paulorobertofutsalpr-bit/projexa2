import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { db } from "@/db";
import { companies, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { hashPassword, createSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);

  const companyName = body?.companyName?.trim();
  const adminName = body?.adminName?.trim();
  const email = body?.email?.trim().toLowerCase();
  const password = body?.password;
  const phone = body?.phone?.trim() || null;

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

  const companyId = randomUUID();
  const userId = randomUUID();
  const passwordHash = await hashPassword(password);

  await db.insert(companies).values({
    id: companyId,
    name: companyName,
    email,
    phone,
    subscriptionStatus: "trial",
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
