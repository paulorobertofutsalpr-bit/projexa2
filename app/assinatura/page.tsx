import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { computeEffectiveStatus, daysRemainingInGrace } from "@/lib/subscription";
import SubscriptionActions from "@/components/SubscriptionActions";

export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<string, string> = {
  trial: "Sem assinatura ativa",
  pending: "Aguardando confirmação de pagamento",
  active: "Assinatura ativa",
  overdue: "Pagamento pendente",
  blocked: "Acesso bloqueado",
  cancelled: "Assinatura cancelada",
};

export default async function AssinaturaPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const effectiveStatus = computeEffectiveStatus({
    subscriptionStatus: user.companySubscriptionStatus,
    subscriptionOverdueSince: user.companySubscriptionOverdueSince,
  });

  const dias = daysRemainingInGrace(user.companySubscriptionOverdueSince);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2 justify-center mb-8">
          <div className="w-9 h-9 rounded bg-blue-600 text-white flex items-center justify-center font-semibold">Pj</div>
          <span className="text-xl font-semibold text-slate-900">Projexa</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-4">
          <div>
            <h1 className="text-lg font-semibold text-slate-900">Assinatura</h1>
            <p className="text-sm text-slate-500 mt-1">{user.companyName}</p>
          </div>

          <div className="flex items-center justify-between py-3 border-y border-slate-100">
            <span className="text-sm text-slate-600">Status atual</span>
            <span className="text-sm font-medium text-slate-900">
              {STATUS_LABELS[effectiveStatus] || effectiveStatus}
            </span>
          </div>

          {effectiveStatus === "overdue" && (
            <div className="text-sm text-amber-700 bg-amber-50 border-l-4 border-amber-300 px-3 py-2 rounded-r-md">
              O acesso será bloqueado em {dias} dia(s) se o pagamento não for regularizado.
            </div>
          )}
          {effectiveStatus === "blocked" && (
            <div className="text-sm text-rose-700 bg-rose-50 border-l-4 border-rose-300 px-3 py-2 rounded-r-md">
              O acesso está bloqueado até a assinatura ser regularizada.
            </div>
          )}

          <div className="text-sm text-slate-600">
            <div className="flex justify-between py-1">
              <span>Valor</span>
              <span className="font-medium text-slate-900">R$ 39,00/mês</span>
            </div>
            <div className="flex justify-between py-1">
              <span>Usuários inclusos</span>
              <span className="font-medium text-slate-900">Ilimitados</span>
            </div>
          </div>

          <SubscriptionActions status={effectiveStatus} isAdmin={user.role === "ADMIN"} />
        </div>
      </div>
    </div>
  );
}
