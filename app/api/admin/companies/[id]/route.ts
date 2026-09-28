import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { companies } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";

const VALID_STATUSES = ["trial", "pending", "active", "overdue", "blocked", "cancelled"];

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  if (!user.isSuperAdmin) {
    return NextResponse.json({ error: "Acesso restrito ao administrador do sistema." }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);

  const update: Record<string, unknown> = {};

  if (typeof body?.subscriptionStatus === "string") {
    if (!VALID_STATUSES.includes(body.subscriptionStatus)) {
      return NextResponse.json({ error: "Status inválido." }, { status: 400 });
    }
    update.subscriptionStatus = body.subscriptionStatus;
    if (body.subscriptionStatus !== "overdue") {
      update.subscriptionOverdueSince = null;
    } else if (!update.subscriptionOverdueSince) {
      update.subscriptionOverdueSince = new Date();
    }
    update.cancelledAt = body.subscriptionStatus === "cancelled" ? new Date() : null;
  }

  if (body?.subscriptionPriceCents !== undefined) {
    const cents = Number(body.subscriptionPriceCents);
    if (!Number.isFinite(cents) || cents <= 0) {
      return NextResponse.json({ error: "Valor de assinatura inválido." }, { status: 400 });
    }
    update.subscriptionPriceCents = Math.round(cents);
  }

  if (typeof body?.lifetimeAccess === "boolean") {
    update.lifetimeAccess = body.lifetimeAccess;
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "Nada para atualizar." }, { status: 400 });
  }

  await db.update(companies).set(update).where(eq(companies.id, id));

  return NextResponse.json({ ok: true });
}
