import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminUsersTable from "@/components/AdminUsersTable";
import AdminPageHeader from "@/components/AdminPageHeader";

export default async function PainelUsuariosPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="space-y-4">
      <AdminPageHeader
        title="Usuários"
        description={
          'Todos os usuários de todas as empresas do sistema. Marque "Administrador do sistema" para dar a alguém acesso a este painel — cuidado, é um poder equivalente ao seu.'
        }
      />
      <AdminUsersTable currentUserId={user.id} />
    </div>
  );
}
