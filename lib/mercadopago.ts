const MP_API = "https://api.mercadopago.com";

function getAccessToken() {
  const token = process.env.MP_ACCESS_TOKEN;
  if (!token) throw new Error("MP_ACCESS_TOKEN não configurado.");
  return token;
}

export async function createSubscription(params: {
  payerEmail: string;
  externalReference: string;
  backUrl: string;
  amount: number;
}) {
  const res = await fetch(`${MP_API}/preapproval`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getAccessToken()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      reason: "Assinatura Projexa",
      external_reference: params.externalReference,
      payer_email: params.payerEmail,
      back_url: params.backUrl,
      auto_recurring: {
        frequency: 1,
        frequency_type: "months",
        transaction_amount: params.amount,
        currency_id: "BRL",
      },
    }),
  });

  const rawText = await res.text();
  let data: any;
  try {
    data = JSON.parse(rawText);
  } catch {
    throw new Error(`Resposta inesperada do Mercado Pago (HTTP ${res.status}): ${rawText.slice(0, 200)}`);
  }
  if (!res.ok) {
    throw new Error(data?.message || `Erro ao criar assinatura no Mercado Pago (HTTP ${res.status}).`);
  }
  return data as { id: string; init_point?: string; sandbox_init_point?: string; status: string };
}

export async function getSubscription(preapprovalId: string) {
  const res = await fetch(`${MP_API}/preapproval/${preapprovalId}`, {
    headers: { Authorization: `Bearer ${getAccessToken()}` },
  });
  const rawText = await res.text();
  let data: any;
  try {
    data = JSON.parse(rawText);
  } catch {
    throw new Error(`Resposta inesperada do Mercado Pago (HTTP ${res.status}): ${rawText.slice(0, 200)}`);
  }
  if (!res.ok) {
    throw new Error(data?.message || `Erro ao consultar assinatura no Mercado Pago (HTTP ${res.status}).`);
  }
  return data as { id: string; status: string; external_reference: string };
}

// Mapeia o status do Mercado Pago para o status interno do Projexa
export function mapMpStatus(mpStatus: string): "active" | "overdue" | "cancelled" {
  if (mpStatus === "authorized") return "active";
  if (mpStatus === "paused") return "overdue";
  return "cancelled";
}
