# Projexa — Arquitetura Técnica e Roadmap de Implementação

> Documento de apoio para orientar as sessões do Claude Code. Use-o **junto** com o briefing original completo (67 seções). Este documento não substitui o briefing — ele traduz o briefing em decisões de arquitetura e em uma ordem de implementação testável, para evitar que o agente tente construir tudo de uma vez e quebre o próprio código.

---

## 1. Visão geral

Projexa é um SaaS multi-tenant de gestão de projetos técnicos (engenharia, arquitetura, segurança contra incêndio, instalações, etc.), cobrindo o fluxo:

```
Cliente → Orçamento → Proposta → Aprovação → Projeto → Execução → Financeiro → Finalização → Arquivo
```

---

## 2. Stack tecnológica recomendada

| Camada | Escolha | Justificativa |
|---|---|---|
| Frontend | Next.js 14+ (App Router) + TypeScript | SSR/SSG, rotas de API no mesmo projeto, ecossistema maduro |
| UI | Tailwind CSS + shadcn/ui | Componentes acessíveis, fácil de tematizar (azul, conforme pedido) |
| Backend | Next.js Route Handlers (API interna) | Evita duplicar infraestrutura; pode extrair para serviço separado depois se precisar escalar |
| ORM | Prisma | Migrations versionadas, type-safety, bom suporte a Postgres |
| Banco | PostgreSQL | Relacional, suporta Row Level Security (importante para isolamento multi-tenant) |
| Autenticação | Auth.js (NextAuth) com sessão JWT | Padrão de mercado, suporta credenciais + recuperação de senha |
| Armazenamento de arquivos | S3-compatível (Cloudflare R2 ou Supabase Storage) | Custo baixo, URLs assinadas para documentos privados |
| Geração de PDF | `@react-pdf/renderer` ou Playwright (HTML→PDF) | Permite usar identidade visual (logo, cores) por tenant |
| Filas/jobs | BullMQ + Redis | Necessário para automações, recorrências e notificações agendadas |
| Deploy | Render (Web Service, deploy automático a cada push no GitHub) + PostgreSQL gerenciado (Render ou Neon) | Fluxo igual ao que você já usa: conecta o repositório do GitHub e o Render cuida do build, do runtime e do restart — sem servidor pra administrar |

Se o Claude Code sugerir alternativas equivalentes (ex: Drizzle em vez de Prisma), tudo bem — o importante é manter a separação de camadas abaixo.

### 2.1 Deploy no Render — o que o Claude Code precisa configurar

- **Tipo de serviço:** Web Service (não "Static Site" — o Projexa usa SSR e API routes do Next.js, que exigem um processo Node persistente).
- **Build command:** `npm install && npm run build`
- **Start command:** `npm start` (equivalente a `next start`)
- **Variáveis de ambiente:** `DATABASE_URL`, segredos de autenticação (Auth.js), chaves do provedor de armazenamento de arquivos — tudo cadastrado no painel do Render, nunca no repositório.
- **Banco de dados:** criar um PostgreSQL gerenciado no próprio Render (mesma região do Web Service, para usar a URL interna e evitar latência/egress) ou apontar `DATABASE_URL` para um Neon/Supabase externo.
- **Migrations:** rodar `npx prisma migrate deploy` como parte do build ou como um "Pre-Deploy Command" no Render, para o banco já subir com o schema atualizado a cada deploy.
- **Atenção ao plano gratuito:** o Postgres free do Render expira em 30 dias (depois exige plano pago a partir de ~$6/mês) e o Web Service free "dorme" após 15 minutos sem uso, com cold start de ~1 minuto na próxima requisição. Bom para testar; para uso real com clientes, vale um plano pago a partir de ~$7/mês por serviço.

---

## 3. Estratégia multi-tenant

**Abordagem recomendada: isolamento por linha (row-level), não schema-per-tenant.**

- Toda tabela de dados de negócio tem uma coluna `company_id`.
- Um middleware/contexto de request injeta `company_id` a partir da sessão autenticada em **toda** query — nunca confiar em `company_id` vindo do client.
- Ativar **Row Level Security (RLS)** no Postgres como camada extra de proteção (defesa em profundidade), não só a aplicação.
- Motivo de não usar schema-per-tenant: simplifica migrations, backups e queries agregadas; schema-per-tenant só compensa em escala muito maior (milhares de empresas) ou exigência contratual de isolamento físico.

Checklist de segurança (seção 42/43 do briefing):
- Toda query passa por uma camada que injeta `company_id`.
- Testes automatizados garantindo que usuário da empresa A nunca lê dado da empresa B.
- Logs de atividade (`activity_logs`) sempre gravam `company_id`, `user_id`, ação, entidade afetada, timestamp.

---

## 4. Modelo de dados (domínios e entidades principais)

Não é o schema Prisma completo (isso o Claude Code deve gerar e iterar), mas o mapa de entidades e relações que ele deve seguir:

### 4.1 Tenancy & Acesso
- `companies` — dados cadastrais, identidade visual, conselho profissional, dados bancários
- `users` — pertence a uma `company`
- `roles`, `permissions`, `role_permissions` — RBAC granular (recurso × ação: visualizar/criar/editar/excluir/aprovar)
- `custom_councils` — conselhos profissionais personalizados (além de CREA, CAU, etc.)

### 4.2 Clientes
- `clients` (PF/PJ) — pertence a `company`
- `client_contacts` — responsável, cargo, contato (para PJ)
- `client_history_events` — timeline automática

### 4.3 Comercial (orçamento → proposta)
- `budget_templates` + `budget_template_items`
- `budgets` + `budget_items` (tudo editável, mesmo vindo de template)
- `payment_plans` + `installments`
- `proposals` — gerado a partir de um `budget`, com número sequencial, validade, status
- `proposal_public_links` — token único, sem necessidade de login do cliente
- `proposal_approvals` — registro de aceite (data/hora, IP, user-agent quando possível)

### 4.4 Projetos
- `projects` — pode nascer de uma `proposal` aprovada
- `project_stages` (etapas) — nome, responsável, prazo, status, checklist, arquivos
- `project_tasks` — com status, prioridade, responsável, checklist, anexos
- `checklists` + `checklist_items` (templates reaproveitáveis por tipo de projeto)
- `project_public_links` — token de acompanhamento público, com controle de quais campos são visíveis
- `project_status_options` — permite status personalizados além dos sugeridos

### 4.5 Documentos
- `documents` — categoria, pasta, projeto relacionado
- `document_versions` — histórico de versões, permite reverter
- `professional_records` (ART/RRT/TRT) — tipo, número, conselho, status, arquivo

### 4.6 Financeiro
- `financial_entries` (receitas e despesas) — categoria, valor, vencimento, status
- `payments` — baixa de recebimentos, vinculado a `installments`
- `expenses` — despesas por fornecedor/categoria
- Views/queries agregadas para fluxo de caixa (não precisa de tabela própria, pode ser calculado)

### 4.7 Contratos e recorrência
- `contracts` — vinculado a cliente/projeto, PDF gerado, assinatura
- `recurring_services` — geram tarefas e cobranças automaticamente

### 4.8 Sistema
- `notifications`
- `activity_logs`
- `templates` (genérico: orçamento, checklist, contrato, relatório)
- `numbering_sequences` — controla prefixos/sequências (`PROP-2026-0001`, etc.), configurável por tipo e por empresa
- `trash_items` — soft delete com prazo configurável antes da exclusão definitiva

---

## 5. Estrutura de pastas sugerida (Next.js App Router)

```
/app
  /(auth)/login, /recuperar-senha
  /(app)/dashboard
  /(app)/clientes/[id]
  /(app)/orcamentos/[id]
  /(app)/projetos/[id]/{visao-geral,etapas,tarefas,documentos,financeiro,...}
  /(app)/financeiro
  /(app)/configuracoes/{empresa,identidade-visual,usuarios,templates,...}
  /(public)/proposta/[token]         ← página pública de aprovação
  /(public)/acompanhar/projeto/[token] ← link de acompanhamento do cliente
  /api/... (route handlers por domínio)
/lib
  /auth, /db (prisma client), /permissions, /pdf, /storage, /numbering
/components
  /ui (shadcn), /dashboard, /forms, /tables, /kanban
/prisma
  schema.prisma, /migrations, seed.ts
/types
/tests
```

---

## 6. Fluxos de estado principais

**Proposta:** `rascunho → enviada → aprovada | recusada → (se aprovada) projeto criado`

**Projeto (status sugeridos, mas personalizáveis):**
`planejamento → aguardando documentos → em andamento → em revisão → aguardando cliente/órgão público/pagamento → pausado → concluído | cancelado`

**Ao concluir um projeto:** registrar data, gerar relatório final, encerrar tarefas e financeiro relacionado (sem apagar), mover para arquivados (nunca excluir).

---

## 7. Roadmap de implementação por fases

Cada fase deve ser **testada de ponta a ponta antes de iniciar a próxima** (exigência explícita do briefing, seção 67). Os números entre colchetes referenciam as seções do briefing original.

**Fase 0 — Fundação** `[54,55,56,42]`
Setup do projeto, banco de dados, migrations iniciais, autenticação, multi-tenancy, RBAC básico, seed de 1 empresa + 1 admin.

**Fase 1 — Clientes & Dashboard esqueleto** `[6,7,5]`
CRUD de clientes, página do cliente, timeline, dashboard com indicadores reais (mesmo que poucos no início).

**Fase 2 — Comercial** `[8,9,10,11,12,13,14,15]`
Templates de orçamento, orçamento editável, geração de PDF da proposta, link público, aprovação digital, criação automática de projeto a partir da proposta aprovada.

**Fase 3 — Projetos** `[16,17,18,19,20,49]`
CRUD de projeto, etapas, tarefas (lista/kanban/calendário), progresso automático, link de acompanhamento público.

**Fase 4 — Documentos** `[21,22,23]`
Upload, categorias, controle de versão, ART/RRT/TRT.

**Fase 5 — Financeiro** `[24,25,26,27]`
Lançamentos, contas a pagar/receber, fluxo de caixa.

**Fase 6 — Operação e visibilidade** `[28,29,30,31,38,39,43,50]`
Relatórios exportáveis, comunicação por projeto, notificações, checklists por tipo, pesquisa global, filtros avançados, log de atividades, central de pendências.

**Fase 7 — Contratos, portal do cliente e recorrência** `[32,33,34,51,52]`
Contratos em PDF, assinatura digital reutilizável, portal do cliente completo, projetos recorrentes.

**Fase 8 — Arquivamento, lixeira e numeração** `[35,36,37,46,47,48]`
Finalização/arquivamento, restauração, lixeira com prazo, numeração automática configurável, duplicação de projeto, templates diversos.

**Fase 9 — Polimento** `[40,41,44,45,60,65]`
Responsividade real (não só reduzida), performance (paginação, cache, otimização de imagens), backups, configurações gerais consolidadas, preparação para planos futuros.

**Fase 10 — Dados demo e teste do fluxo completo** `[62,63,64]`
Seed de dados fictícios e execução do roteiro de 20 passos do briefing (seção 63), corrigindo o que falhar.

---

## 8. Recomendações práticas para as sessões no Claude Code

- Mantenha este arquivo e o briefing original na raiz do repositório; peça ao Claude Code para lê-los no início de cada sessão.
- Peça uma fase por vez. Não peça "implemente tudo" de uma vez — o próprio briefing (seção 67) pede o contrário.
- Depois de cada fase, rode os testes/fluxo relacionado antes de avançar (evita o efeito "quebrou o que já funcionava").
- Use migrations do Prisma (nunca alteração manual de schema) para poder reverter se algo der errado.
- Guarde decisões de arquitetura que o Claude Code tomar (ex: biblioteca de PDF escolhida) neste mesmo arquivo, para consistência entre sessões.

---

## 9. Primeiro prompt sugerido para o Claude Code

```
Leia PROJEXA-ARQUITETURA.md e o briefing completo do projeto.
Implemente apenas a Fase 0 (Fundação): setup do Next.js + TypeScript + Tailwind,
schema Prisma inicial para companies/users/roles/permissions, autenticação,
middleware de isolamento multi-tenant e seed com 1 empresa + 1 usuário admin.
Não avance para outras fases. Ao final, rode o projeto e confirme que o login funciona.
```
