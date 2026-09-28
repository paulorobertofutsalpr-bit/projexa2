import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db";
import { clients } from "@/db/schema";
import { eq } from "drizzle-orm";
import DeleteClientButton from "@/components/DeleteClientButton";

export const dynamic = "force-dynamic";

export default async function ClientesPage() {
  const user = await getCurrentUser();
  const rows = await db.select().from(clients).where(eq(clients.companyId, user!.companyId));

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Clientes</h1>
          <p className="text-slate-500 text-sm mt-1">{rows.length} clientes cadastrados</p>
        </div>
        <Link
          href="/clientes/novo"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-md"
        >
          Novo cliente
        </Link>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500 border-b border-slate-200">
              <th className="px-4 py-3 font-medium">Nome</th>
              <th className="px-4 py-3 font-medium hidden sm:table-cell">Documento</th>
              <th className="px-4 py-3 font-medium hidden md:table-cell">Cidade</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => (
              <tr key={c.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                <td className="px-4 py-3">
                  <Link href={`/clientes/${c.id}`} className="font-medium text-slate-900 hover:text-blue-600">
                    {c.nome}
                  </Link>
                  <div className="text-xs text-slate-400">{c.tipo}</div>
                </td>
                <td className="px-4 py-3 hidden sm:table-cell text-slate-600">{c.documento || "—"}</td>
                <td className="px-4 py-3 hidden md:table-cell text-slate-600">
                  {c.cidade ? `${c.cidade}/${c.estado ?? ""}` : "—"}
                </td>
                <td className="px-4 py-3 text-right">
                  <DeleteClientButton clientId={c.id} />
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-slate-400 text-sm">
                  Nenhum cliente cadastrado ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
