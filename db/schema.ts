import { pgTable, text, timestamp, integer, doublePrecision, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const companies = pgTable("companies", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  document: text("document"),
  phone: text("phone"),
  email: text("email"),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  website: text("website"),
  logoData: text("logo_data"),
  subscriptionStatus: text("subscription_status").notNull().default("trial"),
  mpPreapprovalId: text("mp_preapproval_id"),
  mpPayerEmail: text("mp_payer_email"),
  subscriptionOverdueSince: timestamp("subscription_overdue_since"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("ADMIN"),
  companyId: text("company_id")
    .notNull()
    .references(() => companies.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const sessions = pgTable("sessions", {
  token: text("token").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const clients = pgTable("clients", {
  id: text("id").primaryKey(),
  companyId: text("company_id")
    .notNull()
    .references(() => companies.id),
  tipo: text("tipo").notNull().default("Pessoa Física"),
  nome: text("nome").notNull(),
  documento: text("documento"),
  telefone: text("telefone"),
  email: text("email"),
  cidade: text("cidade"),
  estado: text("estado"),
  endereco: text("endereco"),
  bairro: text("bairro"),
  cep: text("cep"),
  observacoes: text("observacoes"),
  portalToken: text("portal_token").unique(),
  deletedAt: timestamp("deleted_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const clientHistoryEvents = pgTable("client_history_events", {
  id: text("id").primaryKey(),
  clientId: text("client_id")
    .notNull()
    .references(() => clients.id),
  description: text("description").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const budgets = pgTable("budgets", {
  id: text("id").primaryKey(),
  companyId: text("company_id")
    .notNull()
    .references(() => companies.id),
  clientId: text("client_id")
    .notNull()
    .references(() => clients.id),
  numero: text("numero").notNull(),
  status: text("status").notNull().default("Rascunho"),
  objeto: text("objeto"),
  validadeDias: integer("validade_dias").notNull().default(15),
  condicaoPagamento: text("condicao_pagamento"),
  formaPagamento: text("forma_pagamento"),
  prazoExecucao: text("prazo_execucao"),
  previsaoInicio: text("previsao_inicio"),
  localExecucao: text("local_execucao"),
  responsavelTecnico: text("responsavel_tecnico"),
  garantia: text("garantia"),
  escopoIncluso: text("escopo_incluso"),
  escopoNaoIncluso: text("escopo_nao_incluso"),
  observacoesComerciais: text("observacoes_comerciais"),
  total: integer("total").notNull().default(0),
  publicToken: text("public_token").notNull().unique(),
  approvedAt: timestamp("approved_at"),
  approvedIp: text("approved_ip"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const budgetItems = pgTable("budget_items", {
  id: text("id").primaryKey(),
  budgetId: text("budget_id")
    .notNull()
    .references(() => budgets.id),
  categoria: text("categoria").notNull().default("Serviço"),
  nome: text("nome").notNull(),
  observacoes: text("observacoes"),
  quantidade: doublePrecision("quantidade").notNull().default(1),
  unidade: text("unidade").notNull().default("Serviço"),
  valorUnitario: integer("valor_unitario").notNull().default(0),
  desconto: integer("desconto").notNull().default(0),
  valor: integer("valor").notNull(),
});

export const budgetsRelations = relations(budgets, ({ one, many }) => ({
  client: one(clients, {
    fields: [budgets.clientId],
    references: [clients.id],
  }),
  items: many(budgetItems),
}));

export const budgetItemsRelations = relations(budgetItems, ({ one }) => ({
  budget: one(budgets, {
    fields: [budgetItems.budgetId],
    references: [budgets.id],
  }),
}));

export const projects = pgTable("projects", {
  id: text("id").primaryKey(),
  companyId: text("company_id")
    .notNull()
    .references(() => companies.id),
  clientId: text("client_id")
    .notNull()
    .references(() => clients.id),
  budgetId: text("budget_id").references(() => budgets.id),
  numero: text("numero").notNull(),
  nome: text("nome").notNull(),
  descricao: text("descricao"),
  status: text("status").notNull().default("Planejamento"),
  progresso: integer("progresso").notNull().default(0),
  prioridade: text("prioridade").notNull().default("Média"),
  prazo: text("prazo"),
  arquivadoEm: timestamp("arquivado_em"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const documents = pgTable("documents", {
  id: text("id").primaryKey(),
  companyId: text("company_id")
    .notNull()
    .references(() => companies.id),
  projectId: text("project_id")
    .notNull()
    .references(() => projects.id),
  groupId: text("group_id").notNull(),
  categoria: text("categoria").notNull().default("Outros"),
  nome: text("nome").notNull(),
  tipo: text("tipo").notNull(),
  tamanho: integer("tamanho").notNull(),
  conteudo: text("conteudo").notNull(),
  versao: integer("versao").notNull().default(1),
  visivelCliente: boolean("visivel_cliente").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const financialEntries = pgTable("financial_entries", {
  id: text("id").primaryKey(),
  companyId: text("company_id")
    .notNull()
    .references(() => companies.id),
  clientId: text("client_id").references(() => clients.id),
  projectId: text("project_id").references(() => projects.id),
  tipo: text("tipo").notNull(),
  descricao: text("descricao").notNull(),
  categoria: text("categoria").notNull().default("Outros"),
  valor: integer("valor").notNull(),
  vencimento: text("vencimento").notNull(),
  status: text("status").notNull().default("Pendente"),
  dataPagamento: text("data_pagamento"),
  formaPagamento: text("forma_pagamento"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const activityLogs = pgTable("activity_logs", {
  id: text("id").primaryKey(),
  companyId: text("company_id")
    .notNull()
    .references(() => companies.id),
  userId: text("user_id").references(() => users.id),
  userName: text("user_name").notNull(),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const contracts = pgTable("contracts", {
  id: text("id").primaryKey(),
  companyId: text("company_id")
    .notNull()
    .references(() => companies.id),
  clientId: text("client_id")
    .notNull()
    .references(() => clients.id),
  budgetId: text("budget_id").references(() => budgets.id),
  projectId: text("project_id").references(() => projects.id),
  numero: text("numero").notNull(),
  objeto: text("objeto"),
  valor: integer("valor").notNull().default(0),
  condicaoPagamento: text("condicao_pagamento"),
  prazoExecucao: text("prazo_execucao"),
  clausulas: text("clausulas"),
  status: text("status").notNull().default("Rascunho"),
  publicToken: text("public_token").notNull().unique(),
  assinadoNome: text("assinado_nome"),
  assinadoCpf: text("assinado_cpf"),
  assinadoIp: text("assinado_ip"),
  assinadoEm: timestamp("assinado_em"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const numberingSequences = pgTable("numbering_sequences", {
  id: text("id").primaryKey(),
  companyId: text("company_id")
    .notNull()
    .references(() => companies.id),
  tipo: text("tipo").notNull(),
  ano: integer("ano").notNull(),
  prefixo: text("prefixo").notNull(),
  ultimoNumero: integer("ultimo_numero").notNull().default(0),
});

export const projectNotes = pgTable("project_notes", {
  id: text("id").primaryKey(),
  projectId: text("project_id")
    .notNull()
    .references(() => projects.id),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  userName: text("user_name").notNull(),
  texto: text("texto").notNull(),
  editedAt: timestamp("edited_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const projectsRelations = relations(projects, ({ one }) => ({
  client: one(clients, {
    fields: [projects.clientId],
    references: [clients.id],
  }),
  budget: one(budgets, {
    fields: [projects.budgetId],
    references: [budgets.id],
  }),
}));

export const companiesRelations = relations(companies, ({ many }) => ({
  users: many(users),
  clients: many(clients),
  budgets: many(budgets),
  projects: many(projects),
}));

export const usersRelations = relations(users, ({ one }) => ({
  company: one(companies, {
    fields: [users.companyId],
    references: [companies.id],
  }),
}));

export const clientsRelations = relations(clients, ({ one, many }) => ({
  company: one(companies, {
    fields: [clients.companyId],
    references: [companies.id],
  }),
  history: many(clientHistoryEvents),
}));

export const clientHistoryEventsRelations = relations(clientHistoryEvents, ({ one }) => ({
  client: one(clients, {
    fields: [clientHistoryEvents.clientId],
    references: [clients.id],
  }),
}));
