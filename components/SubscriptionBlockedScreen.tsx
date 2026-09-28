import Link from "next/link";
import { Lock } from "lucide-react";

export default function SubscriptionBlockedScreen() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="max-w-sm text-center">
        <div className="w-14 h-14 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
          <Lock size={24} />
        </div>
        <h1 className="text-xl font-semibold text-slate-900 mb-2">Acesso bloqueado</h1>
        <p className="text-sm text-slate-500 mb-6">
          O pagamento da assinatura não foi regularizado dentro do prazo. Regularize para voltar a acessar o sistema.
        </p>
        <Link
          href="/assinatura"
          className="inline-block px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
        >
          Regularizar assinatura
        </Link>
      </div>
    </div>
  );
}
