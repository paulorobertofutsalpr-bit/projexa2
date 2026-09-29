import { notFound } from "next/navigation";
import { db } from "@/db";
import { sellers } from "@/db/schema";
import { eq } from "drizzle-orm";
import SellerReport from "@/components/SellerReport";

export const dynamic = "force-dynamic";

export default async function VendedorPortalPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  const rows = await db.select().from(sellers).where(eq(sellers.portalToken, token));
  const seller = rows[0];
  if (!seller) notFound();

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-5">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
            Pj
          </div>
          <div>
            <div className="font-semibold text-slate-900">Projexa</div>
            <div className="text-xs text-slate-400">Relatório de comissão do vendedor</div>
          </div>
        </div>
        <SellerReport
          apiBase={`/api/public/vendedor/${token}`}
          printBase={`/vendedor/${token}/imprimir`}
          showCsvExport={false}
        />
      </div>
    </div>
  );
}
