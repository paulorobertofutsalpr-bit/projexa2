import AdminMessagesPanel from "@/components/AdminMessagesPanel";
import AdminPageHeader from "@/components/AdminPageHeader";

export default function PainelMensagensPage() {
  return (
    <div className="space-y-4">
      <AdminPageHeader
        title="Mensagens"
        description="Converse diretamente com os usuários de cada empresa. Selecione uma empresa na lista para ver e responder às mensagens."
      />
      <AdminMessagesPanel />
    </div>
  );
}
