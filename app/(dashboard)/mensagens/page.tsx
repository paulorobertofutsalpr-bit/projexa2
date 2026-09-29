import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import MessagesThread from "@/components/MessagesThread";

export default async function MensagensPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Mensagens</h1>
        <p className="text-sm text-slate-500 mt-1">
          Converse diretamente com o administrador do sistema Projexa. Dúvidas, suporte ou solicitações.
        </p>
      </div>
      <MessagesThread
        fetchUrl="/api/messages"
        postUrl="/api/messages"
        viewerIsSuperAdmin={false}
        emptyLabel="Nenhuma mensagem ainda. Envie a primeira mensagem para o administrador do sistema."
      />
    </div>
  );
}
