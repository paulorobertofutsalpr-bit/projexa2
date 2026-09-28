import CouponsManager from "@/components/CouponsManager";

export default function PainelCuponsPage() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-500">
        Cupons aplicados no cadastro público (/cadastro). Percentual e valor fixo descontam da mensalidade; "grátis"
        zera o valor cobrado; "vitalício" dá acesso permanente sem cobrança.
      </p>
      <CouponsManager />
    </div>
  );
}
