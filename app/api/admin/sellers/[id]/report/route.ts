import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { sellers, companies } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";

function monthRange(month: string): { start: Date; end: Date } {
  const [yearStr, monthStr] = month.split("-");
  const year = Number(yearStr);
  const monthIdx = Number(monthStr) - 1;
  const start = new Date(year, monthIdx, 1, 0, 0, 0, 0);
  const end = new Date(year, monthIdx + 1, 0, 23, 59, 59, 999);
  return { start, end };
}

type RowStatus = "ativo" | "cancelado" | "nao_pagou" | "bloqueado" | "inativo" | "vitalicio";

const STATUS_LABELS: Record<RowStatus, string> = {
  ativo: "Ativo (mensal)",
  cancelado: "Cancelado",
  nao_pagou: "Não pagou (atrasado)",
  bloqueado: "Bloqueado",
  inativo: "Inativo (sem assinatura)",
  vitalicio: "Vitalício",
};

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
  const { start, end } = monthRange(month);

  const rows = await db
    .select()
    .from(companies)
    .where(and(eq(companies.sellerId, id), eq(companies.isTest, false)));

  const relevant = rows.filter((c) => new Date(c.createdAt) <= end);

  const result = relevant.map((c) => {
    let rowStatus: RowStatus;
    let commissionCents = 0;

    const cancelledInMonth = c.cancelledAt && new Date(c.cancelledAt) >= start && new Date(c.cancelledAt) <= end;
    const cancelledBeforeMonth = c.cancelledAt && new Date(c.cancelledAt) < start;
    const createdInMonth = new Date(c.createdAt) >= start && new Date(c.createdAt) <= end;

    if (c.lifetimeAccess) {
      rowStatus = "vitalicio";
      if (createdInMonth) {
        commissionCents = Math.round((c.subscriptionPriceCents * seller.commissionPercent) / 100);
      }
    } else if (cancelledBeforeMonth) {
      rowStatus = "cancelado";
    } else if (cancelledInMonth) {
      rowStatus = "cancelado";
    } else if (c.subscriptionStatus === "active") {
      rowStatus = "ativo";
      commissionCents = Math.round((c.subscriptionPriceCents * seller.commissionPercent) / 100);
    } else if (c.subscriptionStatus === "overdue") {
      rowStatus = "nao_pagou";
    } else if (c.subscriptionStatus === "blocked") {
      rowStatus = "bloqueado";
    } else if (c.subscriptionStatus === "cancelled") {
      rowStatus = "cancelado";
    } else {
      rowStatus = "inativo";
    }

    return {
      id: c.id,
      name: c.name,
      email: c.email,
      phone: c.phone,
      subscriptionStatus: c.subscriptionStatus,
      subscriptionPriceCents: c.subscriptionPriceCents,
      lifetimeAccess: c.lifetimeAccess,
      createdAt: c.createdAt,
      cancelledAt: c.cancelledAt,
      rowStatus,
      rowStatusLabel: STATUS_LABELS[rowStatus],
      commissionCents,
    };
  });

  const summary = {
    ativo: result.filter((r) => r.rowStatus === "ativo").length,
    cancelado: result.filter((r) => r.rowStatus === "cancelado").length,
    nao_pagou: result.filter((r) => r.rowStatus === "nao_pagou").length,
    bloqueado: result.filter((r) => r.rowStatus === "bloqueado").length,
    inativo: result.filter((r) => r.rowStatus === "inativo").length,
    vitalicio: result.filter((r) => r.rowStatus === "vitalicio").length,
    totalComissaoCents: result.reduce((s, r) => s + r.commissionCents, 0),
  };

  return NextResponse.json({
    seller: { id: seller.id, name: seller.name, code: seller.code, commissionPercent: seller.commissionPercent },
    month,
    companies: result,
    summary,
  });
}
