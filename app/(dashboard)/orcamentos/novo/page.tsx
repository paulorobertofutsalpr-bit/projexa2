import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db";
import { clients } from "@/db/schema";
import { eq } from "drizzle-orm";
import NovoOrcamentoForm from "@/components/NovoOrcamentoForm";

export const dynamic = "force-dynamic";

export default async function NovoOrcamentoPage() {
  const user = await getCurrentUser();
  const clientRows = await db.select().from(clients).where(eq(clients.companyId, user!.companyId));

  return <NovoOrcamentoForm clients={clientRows} />;
}
