import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

// Rota de uso único para promover a primeira conta a administrador do sistema
// (superadmin). Só funciona se: (1) SUPERADMIN_BOOTSTRAP_SECRET estiver
// configurada no ambiente, (2) o segredo enviado bater exatamente, e
// (3) ainda não existir nenhum superadmin no banco. Depois do primeiro uso
// bem-sucedido ela se desativa sozinha (condição 3 deixa de ser verdadeira).
export async function GET(request: NextRequest) {
  const secretEnv = process.env.SUPERADMIN_BOOTSTRAP_SECRET;
  if (!secretEnv) {
    return NextResponse.json({ error: "Bootstrap não configurado." }, { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");
  const email = searchParams.get("email")?.trim().toLowerCase();

  if (!secret || secret !== secretEnv) {
    return NextResponse.json({ error: "Segredo inválido." }, { status: 403 });
  }
  if (!email) {
    return NextResponse.json({ error: "Informe ?email=seu@email.com" }, { status: 400 });
  }

  const existingSuperAdmins = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(users)
    .where(eq(users.isSuperAdmin, true));

  if ((existingSuperAdmins[0]?.count ?? 0) > 0) {
    return NextResponse.json(
      { error: "Já existe um administrador do sistema. Esta rota já foi usada e está desativada." },
      { status: 409 }
    );
  }

  const rows = await db.select().from(users).where(eq(users.email, email));
  if (!rows[0]) {
    return NextResponse.json({ error: "Nenhum usuário encontrado com esse e-mail." }, { status: 404 });
  }

  await db.update(users).set({ isSuperAdmin: true }).where(eq(users.email, email));

  return NextResponse.json({ ok: true, message: `${email} agora é administrador do sistema.` });
}
