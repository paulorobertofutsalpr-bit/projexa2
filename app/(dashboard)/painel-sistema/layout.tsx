import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import PainelSistemaNav from "@/components/PainelSistemaNav";

export default async function PainelSistemaLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!user.isSuperAdmin) redirect("/dashboard");

  return (
    <div className="max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Painel do sistema</h1>
        <p className="text-slate-500 text-sm mt-1">
          Área exclusiva do administrador do Projexa — gestão de todas as empresas assinantes.
        </p>
      </div>
      <PainelSistemaNav />
      {children}
    </div>
  );
}
