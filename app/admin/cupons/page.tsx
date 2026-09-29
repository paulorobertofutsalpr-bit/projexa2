import CouponsManager from "@/components/CouponsManager";
import AdminPageHeader from "@/components/AdminPageHeader";

export default function PainelCuponsPage() {
  return (
    <div className="space-y-4">
      <AdminPageHeader
        title="Cupons"
        description={
          'Cupons aplicados no cadastro público (/cadastro). Percentual e valor fixo descontam da mensalidade; "grátis" zera o valor cobrado; "vitalício" dá acesso permanente sem cobrança.'
        }
      />
      <CouponsManager />
    </div>
  );
}
