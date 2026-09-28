import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db";
import { financialEntries, clients } from "@/db/schema";
import { eq } from "drizzle-orm";
import FinanceiroClient from "@/components/FinanceiroClient";

export const dynamic = "force-dynamic";

export default async function FinanceiroPage() {
  const user = await getCurrentUser();

  const rows = await db.select().from(financialEntries).where(eq(financialEntries.companyId, user!.companyId));
  const clientRows = await db.select({ id: clients.id, nome: clients.nome }).from(clients).where(eq(clients.companyId, user!.companyId));

  return <FinanceiroClient initialEntries={rows} clients={clientRows} />;
}
