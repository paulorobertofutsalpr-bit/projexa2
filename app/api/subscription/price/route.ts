import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { companies } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";

export async function PUT(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  if (!user.isSuperAdmin) {
    return NextResponse.json(
      { error: "Só o administrador do sistema Projexa pode alterar o valor da assinatura." },
      { status: 403 }
    );
  }

  const body = await request.json().catch(() => null);
  const price = Number(body?.price);
  const companyId = typeof body?.companyId === "string" ? body.companyId : user.companyId;
  if (!price || price <= 0) {
    return NextResponse.json({ error: "Informe um valor válido." }, { status: 400 });
  }

  await db
    .update(companies)
    .set({ subscriptionPriceCents: Math.round(price * 100) })
    .where(eq(companies.id, companyId));

  return NextResponse.json({ ok: true });
}
