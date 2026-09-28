import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { companies } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSubscription, mapMpStatus } from "@/lib/mercadopago";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);

  // O Mercado Pago manda notificações de tipos diferentes (payment, subscription_preapproval).
  // Para assinatura, o que importa é o preapproval id.
  const preapprovalId =
    body?.data?.id && (body?.type === "subscription_preapproval" || body?.type === "preapproval")
      ? body.data.id
      : request.nextUrl.searchParams.get("id") || request.nextUrl.searchParams.get("data.id");

  if (!preapprovalId) {
    // Notificação de outro tipo (ex: payment avulso) — confirmamos recebimento sem processar.
    return NextResponse.json({ ok: true, ignored: true });
  }

  try {
    const subscription = await getSubscription(preapprovalId);
    const companyId = subscription.external_reference;
    if (!companyId) return NextResponse.json({ ok: true });

    const rows = await db.select().from(companies).where(eq(companies.id, companyId));
    const company = rows[0];
    if (!company) return NextResponse.json({ ok: true });

    const newStatus = mapMpStatus(subscription.status);

    const update: { subscriptionStatus: string; subscriptionOverdueSince?: Date | null } = {
      subscriptionStatus: newStatus,
    };

    if (newStatus === "overdue" && company.subscriptionStatus !== "overdue" && company.subscriptionStatus !== "blocked") {
      update.subscriptionOverdueSince = new Date();
    }
    if (newStatus === "active") {
      update.subscriptionOverdueSince = null;
    }

    await db.update(companies).set(update).where(eq(companies.id, companyId));

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Erro ao processar webhook do Mercado Pago:", err);
    // Responder 200 mesmo em erro interno evita que o Mercado Pago fique reenviando repetidamente
    // notificações que sabemos que vão falhar da mesma forma (ex: preapproval de teste inválido).
    return NextResponse.json({ ok: true, error: "processed_with_warning" });
  }
}

export async function GET() {
  return NextResponse.json({ ok: true, message: "Webhook do Mercado Pago ativo." });
}
