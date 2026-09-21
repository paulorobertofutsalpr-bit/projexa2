import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { daysRemainingInGrace } from "@/lib/subscription";

export default function SubscriptionBanner({ overdueSince }: { overdueSince: Date | string | null }) {
  const dias = daysRemainingInGrace(overdueSince);
  return (
    <div className="bg-amber-50 border-b border-amber-200 px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3 flex-wrap">
      <div className="flex items-center gap-2 text-sm text-amber-800">
        <AlertTriangle size={16} className="shrink-0" />
        <span>
          Pagamento da assinatura pendente. O acesso será bloqueado em <strong>{dias} dia(s)</strong> se não for
          regularizado.
        </span>
      </div>
      <Link href="/assinatura" className="text-sm font-medium text-amber-900 hover:underline shrink-0">
        Regularizar agora
      </Link>
    </div>
  );
}
