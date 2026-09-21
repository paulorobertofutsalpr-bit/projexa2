import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { companies } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { createSubscription } from "@/lib/mercadopago";

const SUBSCRIPTION_PRICE = 39.0;

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  if (user.role !== "ADMIN") {
    return NextResponse.json({ error: "Só administradores podem gerenciar a assinatura." }, { status: 403 });
  }

  const origin = process.env.APP_URL || request.nextUrl.origin;
  const backUrl = `${origin}/assinatura`;

  try {
    const subscription = await createSubscription({
      payerEmail: user.email,
      externalReference: user.companyId,
      backUrl,
      amount: SUBSCRIPTION_PRICE,
    });

    await db
      .update(companies)
      .set({ mpPreapprovalId: subscription.id, mpPayerEmail: user.email, subscriptionStatus: "pending" })
      .where(eq(companies.id, user.companyId));

    const checkoutUrl = subscription.init_point || subscription.sandbox_init_point;
    return NextResponse.json({ ok: true, checkoutUrl });
  } catch (err) {
    return NextResponse.json(
      { error: (err instanceof Error ? err.message : "Erro ao criar assinatura.") + ` [debug back_url="${backUrl}", payer_email="${user.email}"]` },
      { status: 500 }
    );
  }
}
