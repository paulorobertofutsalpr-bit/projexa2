import { db } from "./index";
import { companies, users, clients, budgets, budgetItems, projects, financialEntries } from "./schema";
import { eq } from "drizzle-orm";
import { hashPassword } from "@/lib/auth";
import { randomUUID, randomBytes } from "crypto";

async function main() {
  const companyId = "seed-company-1";

  const existingCompany = await db.select().from(companies).where(eq(companies.id, companyId));
  if (existingCompany.length === 0) {
    await db.insert(companies).values({
      id: companyId,
      name: "Escritório Modelo Projexa",
      document: "00.000.000/0001-00",
      phone: "(37) 3221-0000",
      email: "contato@projexa.com.br",
      address: "Rua das Engenharias, 100",
      city: "Itaúna",
      state: "MG",
    });
    console.log("Empresa de exemplo criada.");
  } else {
    console.log("Empresa de exemplo já existe, pulando.");
  }

  const existingUser = await db.select().from(users).where(eq(users.email, "admin@projexa.com.br"));
  if (existingUser.length === 0) {
    const passwordHash = await hashPassword("projexa123");
    await db.insert(users).values({
      id: "seed-user-1",
      name: "Administrador",
      email: "admin@projexa.com.br",
      passwordHash,
      role: "ADMIN",
      companyId,
    });
    console.log("Usuário admin criado (senha: projexa123).");
  } else {
    console.log("Usuário admin já existe, pulando.");
  }

  const existingUser2 = await db.select().from(users).where(eq(users.email, "equipe@projexa.com.br"));
  if (existingUser2.length === 0) {
    const passwordHash = await hashPassword("projexa123");
    await db.insert(users).values({
      id: "seed-user-2",
      name: "Maria Engenheira",
      email: "equipe@projexa.com.br",
      passwordHash,
      role: "USUARIO",
      companyId,
    });
    console.log("Usuário de equipe criado (senha: projexa123).");
  } else {
    console.log("Usuário de equipe já existe, pulando.");
  }

  const existingClients = await db.select().from(clients).where(eq(clients.companyId, companyId));
  let clientIds: string[] = existingClients.map((c) => c.id);

  if (existingClients.length === 0) {
    const demoClients = [
      {
        id: "seed-client-1",
        tipo: "Pessoa Jurídica",
        nome: "Construtora Vale Verde Ltda",
        documento: "12.345.678/0001-90",
        telefone: "(37) 3221-4455",
        email: "contato@valeverde.com.br",
        endereco: "Av. Getúlio Vargas, 850",
        bairro: "Centro",
        cidade: "Itaúna",
        estado: "MG",
        cep: "35680-000",
      },
      {
        id: "seed-client-2",
        tipo: "Pessoa Física",
        nome: "Marina Souza Ribeiro",
        documento: "123.456.789-00",
        telefone: "(37) 99911-2233",
        email: "marina.ribeiro@gmail.com",
        endereco: "Rua das Palmeiras, 220",
        bairro: "Jardim América",
        cidade: "Divinópolis",
        estado: "MG",
        cep: "35500-000",
      },
      {
        id: "seed-client-3",
        tipo: "Pessoa Jurídica",
        nome: "Indústria Metalúrgica Aço Forte S.A.",
        documento: "98.765.432/0001-11",
        telefone: "(37) 3212-9090",
        email: "engenharia@acoforte.ind.br",
        endereco: "Rodovia MG-431, km 12",
        bairro: "Distrito Industrial",
        cidade: "Itaúna",
        estado: "MG",
        cep: "35680-100",
      },
    ];
    for (const c of demoClients) {
      await db.insert(clients).values({ ...c, companyId, portalToken: randomBytes(16).toString("hex") });
    }
    clientIds = demoClients.map((c) => c.id);
    console.log("3 clientes de exemplo criados.");
  } else {
    console.log("Clientes já existem, pulando.");
  }

  const existingBudgets = await db.select().from(budgets).where(eq(budgets.companyId, companyId));
  if (existingBudgets.length === 0 && clientIds.length >= 3) {
    const demoBudgets = [
      {
        id: "seed-budget-1",
        clientId: clientIds[0],
        numero: "ORC-2026-0001",
        objeto: "Prestação de serviços técnicos para elaboração de projeto arquitetônico e estrutural residencial.",
        status: "Aprovado",
        condicaoPagamento: "50% na aprovação + 50% na entrega",
        prazoExecucao: "30 dias úteis",
        escopoIncluso: "Levantamento de dados\nDesenvolvimento do projeto\nEntrega digital em PDF e DWG",
        escopoNaoIncluso: "Execução da obra\nTaxas de aprovação em órgãos públicos",
        items: [
          { nome: "Projeto arquitetônico", valorUnitario: 800000, quantidade: 1 },
          { nome: "Projeto estrutural", valorUnitario: 550000, quantidade: 1 },
        ],
      },
      {
        id: "seed-budget-2",
        clientId: clientIds[1],
        numero: "ORC-2026-0002",
        objeto: "Laudo técnico de vistoria predial.",
        status: "Enviado",
        condicaoPagamento: "À vista",
        prazoExecucao: "10 dias úteis",
        items: [{ nome: "Laudo técnico", valorUnitario: 180000, quantidade: 1 }],
      },
      {
        id: "seed-budget-3",
        clientId: clientIds[2],
        numero: "ORC-2026-0003",
        objeto: "Projeto elétrico industrial e sistema de prevenção contra incêndio.",
        status: "Aprovado",
        condicaoPagamento: "30/40/30",
        prazoExecucao: "45 dias úteis",
        escopoIncluso: "Levantamento das instalações existentes\nProjeto elétrico completo\nProjeto de prevenção contra incêndio\nART/RRT",
        items: [
          { nome: "Projeto elétrico industrial", valorUnitario: 1200000, quantidade: 1 },
          { nome: "Projeto de prevenção contra incêndio", valorUnitario: 900000, quantidade: 1 },
        ],
      },
      {
        id: "seed-budget-4",
        clientId: clientIds[1],
        numero: "ORC-2026-0004",
        objeto: "Consultoria técnica mensal.",
        status: "Rascunho",
        items: [{ nome: "Consultoria", valorUnitario: 250000, quantidade: 1 }],
      },
      {
        id: "seed-budget-5",
        clientId: clientIds[0],
        numero: "ORC-2026-0005",
        objeto: "Projeto hidrossanitário complementar.",
        status: "Recusado",
        items: [{ nome: "Projeto hidrossanitário", valorUnitario: 420000, quantidade: 1 }],
      },
    ];

    for (const b of demoBudgets) {
      const total = b.items.reduce((s, i) => s + i.valorUnitario * i.quantidade, 0);
      await db.insert(budgets).values({
        id: b.id,
        companyId,
        clientId: b.clientId,
        numero: b.numero,
        objeto: b.objeto,
        status: b.status,
        condicaoPagamento: b.condicaoPagamento || null,
        prazoExecucao: b.prazoExecucao || null,
        escopoIncluso: b.escopoIncluso || null,
        escopoNaoIncluso: b.escopoNaoIncluso || null,
        total,
        publicToken: randomBytes(16).toString("hex"),
        approvedAt: b.status === "Aprovado" ? new Date() : null,
      });
      for (const item of b.items) {
        await db.insert(budgetItems).values({
          id: randomUUID(),
          budgetId: b.id,
          nome: item.nome,
          quantidade: item.quantidade,
          unidade: "Serviço",
          valorUnitario: item.valorUnitario,
          desconto: 0,
          valor: item.valorUnitario * item.quantidade,
        });
      }
    }
    console.log("5 orçamentos de exemplo criados.");
  } else {
    console.log("Orçamentos já existem, pulando.");
  }

  const existingProjects = await db.select().from(projects).where(eq(projects.companyId, companyId));
  if (existingProjects.length === 0 && clientIds.length >= 3) {
    const demoProjects = [
      {
        id: "seed-project-1",
        clientId: clientIds[0],
        budgetId: "seed-budget-1",
        numero: "PROJ-2026-0001",
        nome: "Residencial Vale Verde — Bloco A",
        status: "Em andamento",
        progresso: 65,
        prazo: "2026-11-15",
        prioridade: "Alta",
      },
      {
        id: "seed-project-2",
        clientId: clientIds[2],
        budgetId: "seed-budget-3",
        numero: "PROJ-2026-0002",
        nome: "Modernização elétrica — Planta industrial",
        status: "Planejamento",
        progresso: 15,
        prazo: "2026-12-20",
        prioridade: "Média",
      },
      {
        id: "seed-project-3",
        clientId: clientIds[2],
        budgetId: null,
        numero: "PROJ-2026-0003",
        nome: "Sistema de prevenção contra incêndio",
        status: "Concluído",
        progresso: 100,
        prazo: "2026-08-30",
        prioridade: "Alta",
      },
    ];
    for (const p of demoProjects) {
      await db.insert(projects).values({ ...p, companyId });
    }
    console.log("3 projetos de exemplo criados.");
  } else {
    console.log("Projetos já existem, pulando.");
  }

  const existingFinance = await db.select().from(financialEntries).where(eq(financialEntries.companyId, companyId));
  if (existingFinance.length === 0 && clientIds.length >= 3) {
    const demoFinance = [
      { tipo: "receita", descricao: "Entrada — Residencial Vale Verde", categoria: "Projetos", valor: 400000, vencimento: "2026-08-10", status: "Pago", clientId: clientIds[0], dataPagamento: "2026-08-10" },
      { tipo: "receita", descricao: "Parcela final — Residencial Vale Verde", categoria: "Projetos", valor: 400000, vencimento: "2026-09-25", status: "Pendente", clientId: clientIds[0] },
      { tipo: "receita", descricao: "Entrada — Modernização elétrica", categoria: "Projetos", valor: 700000, vencimento: "2026-09-05", status: "Pendente", clientId: clientIds[2] },
      { tipo: "despesa", descricao: "Assinatura de software CAD", categoria: "Softwares", valor: 35000, vencimento: "2026-09-18", status: "Pendente", clientId: null },
      { tipo: "despesa", descricao: "Taxas ART/RRT do mês", categoria: "Impostos", valor: 48000, vencimento: "2026-09-10", status: "Pago", clientId: null, dataPagamento: "2026-09-10" },
    ];
    for (const f of demoFinance) {
      await db.insert(financialEntries).values({ id: randomUUID(), companyId, ...f });
    }
    console.log("5 lançamentos financeiros de exemplo criados.");
  } else {
    console.log("Lançamentos financeiros já existem, pulando.");
  }

  console.log("\nSeed concluído. Login: admin@projexa.com.br / projexa123");
  process.exit(0);
}

main().catch((err) => {
  console.error("Erro ao rodar seed:", err);
  process.exit(1);
});
