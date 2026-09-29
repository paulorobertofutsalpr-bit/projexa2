import PlansManager from "@/components/PlansManager";
import AdminPageHeader from "@/components/AdminPageHeader";

export default function AdminPlanosPage() {
  return (
    <div className="space-y-4">
      <AdminPageHeader
        title="Planos"
        description="Planos configuráveis sem alterar código. Cada empresa pode ser vinculada a um plano na tela de Clientes."
      />
      <PlansManager />
    </div>
  );
}
