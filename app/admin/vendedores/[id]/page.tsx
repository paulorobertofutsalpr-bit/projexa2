import Link from "next/link";
import AdminPageHeader from "@/components/AdminPageHeader";
import SellerReport from "@/components/SellerReport";
import SellerPortalLink from "@/components/SellerPortalLink";

export default async function VendedorRelatorioPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <div className="space-y-4">
      <Link href="/admin/vendedores" className="text-sm text-blue-600 hover:underline">
        ← Voltar para vendedores
      </Link>
      <AdminPageHeader
        title="Relatório de comissão"
        description="Histórico mensal transparente para pagamento do vendedor — clientes reais, sem cadastros de teste."
      />
      <SellerPortalLink sellerId={id} />
      <SellerReport apiBase={`/api/admin/sellers/${id}`} />
    </div>
  );
}
