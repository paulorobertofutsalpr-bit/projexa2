import SellersManager from "@/components/SellersManager";
import AdminPageHeader from "@/components/AdminPageHeader";

export default function PainelVendedoresPage() {
  return (
    <div className="space-y-4">
      <AdminPageHeader
        title="Vendedores"
        description="Vendedores/afiliados com código próprio e comissão sobre empresas indicadas."
      />
      <SellersManager />
    </div>
  );
}
