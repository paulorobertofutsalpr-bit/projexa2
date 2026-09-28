"use client";

import { useState } from "react";

export default function SubscriptionActions({ status, isAdmin }: { status: string; isAdmin: boolean }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function startCheckout() {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/subscription/checkout", { method: "POST" });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Erro ao iniciar checkout.");
      setLoading(false);
      return;
    }
    window.location.href = data.checkoutUrl;
  }

  if (!isAdmin) {
    return (
      <p className="text-xs text-slate-400 text-center pt-2">
        Somente um administrador pode gerenciar a assinatura.
      </p>
    );
  }

  if (status === "active") {
    return <p className="text-xs text-emerald-600 text-center pt-2">Tudo certo — sua assinatura está em dia.</p>;
  }

  return (
    <div className="pt-2 space-y-2">
      {error && (
        <div className="text-sm text-rose-700 bg-rose-50 border-l-4 border-rose-300 px-3 py-2 rounded-r-md">{error}</div>
      )}
      <button
        onClick={startCheckout}
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2.5 rounded-md disabled:opacity-50"
      >
        {loading ? "Abrindo checkout..." : status === "overdue" || status === "blocked" ? "Regularizar pagamento" : "Assinar agora"}
      </button>
      <p className="text-xs text-slate-400 text-center">Você será redirecionado para o Mercado Pago.</p>
    </div>
  );
}
