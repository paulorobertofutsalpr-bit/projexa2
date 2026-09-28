# Projexa — Assinatura via Mercado Pago (v14)

**Login de teste após rodar o seed:** `admin@projexa.com.br` / `projexa123`

## Novidades desta entrega

- **Assinatura única** (R$ 39,00/mês, usuários ilimitados) via Mercado Pago, usando a API de Assinaturas (`preapproval`) — o Mercado Pago hospeda a própria tela de pagamento, o Projexa não lida com dados de cartão.
- Página `/assinatura`: mostra o status atual e o botão para assinar/regularizar. Fica acessível mesmo quando o acesso está bloqueado, para poder pagar.
- **Aviso automático**: se o pagamento falhar, aparece um banner no topo do sistema avisando quantos dias faltam antes do bloqueio.
- **Bloqueio automático após 3 dias**: se não for regularizado, o sistema bloqueia o acesso (exceto a própria página de assinatura) até o pagamento ser feito.
- Webhook em `/api/webhooks/mercadopago` recebe as notificações do Mercado Pago e atualiza o status automaticamente.

## ⚠️ Configuração necessária no Render antes de funcionar

1. Vá em **Settings → Environment** do seu Web Service e adicione:
   - `MP_ACCESS_TOKEN` → seu Access Token do Mercado Pago (comece com o de **teste**, que já testamos a lógica interna com ele)
   - `MP_PUBLIC_KEY` → sua Public Key (não é usada no backend ainda, mas deixe configurada)
2. No painel do Mercado Pago (**Developers → Sua aplicação → Webhooks**), cadastre a URL:
   `https://projexa-ue54.onrender.com/api/webhooks/mercadopago`
   e marque para receber eventos de **assinaturas (subscription_preapproval)**.

## O que foi testado e o que ainda depende do deploy

- ✅ Testado aqui: toda a lógica de bloqueio e carência de 3 dias (simulei diferentes datas de atraso direto no banco e confirmei bloqueio/liberação automáticos), a página `/assinatura` continuando acessível mesmo bloqueado, e o tratamento de erro da chamada à API.
- ⏳ **Só será possível testar depois do deploy**: a criação real do checkout e o recebimento do webhook, porque o Mercado Pago não está liberado na rede do meu ambiente de testes aqui (só terá acesso livre à internet quando estiver rodando no Render). Depois de configurar as variáveis acima, teste clicando em "Assinar agora" em `/assinatura` — se abrir a tela do Mercado Pago normalmente, a integração está funcionando.


Base do sistema Projexa: Next.js 16 (App Router) + TypeScript + Tailwind CSS + Drizzle ORM + PostgreSQL.

Este é o esqueleto da **Fase 0** do roadmap (ver `PROJEXA-ARQUITETURA.md`): projeto rodando, conectado ao banco, com uma tabela de empresas e usuários. As próximas fases (clientes, orçamentos, projetos, financeiro etc.) devem ser construídas em cima desta base, seguindo o roadmap.

## Stack

- **Next.js 16** (App Router, Turbopack)
- **TypeScript**
- **Tailwind CSS v4**
- **Drizzle ORM** + `pg` (driver nativo do PostgreSQL, sem binários nativos — funciona em qualquer ambiente, inclusive com restrição de rede)
- **PostgreSQL**

> Nota: o documento de arquitetura original recomendava Prisma. Trocamos para Drizzle ORM porque ele não depende de binários nativos baixados de servidores externos no momento do build — o que o torna mais confiável em ambientes de CI/CD com rede restrita. Funcionalmente, cumpre o mesmo papel.

## Rodando localmente

1. Instale as dependências:
   ```bash
   npm install
   ```
2. Copie `.env.example` para `.env` e preencha `DATABASE_URL` com um Postgres local ou remoto.
3. Rode as migrations:
   ```bash
   npm run db:migrate
   ```
4. (Opcional) Popule dados de exemplo:
   ```bash
   npm run db:seed
   ```
5. Suba o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
6. Acesse `http://localhost:3000` — a página mostra o status da conexão com o banco e as empresas cadastradas.

Health check disponível em `/api/health`.

## Alterando o schema do banco

Edite `db/schema.ts` e depois gere uma nova migration:

```bash
npm run db:generate
```

Isso cria um novo arquivo SQL em `db/migrations/`. Rode `npm run db:migrate` para aplicá-lo.

## Deploy no Render

Este projeto está pronto para o fluxo GitHub → Render:

1. Suba este código para o repositório GitHub já conectado ao seu Web Service no Render.
2. Configurações do Web Service:
   - **Build Command:** `npm install && npm run db:migrate && npm run build`
   - **Start Command:** `npm start`
3. Variáveis de ambiente (aba Environment do Web Service):
   - `DATABASE_URL` → a Internal Database URL do seu Postgres no Render
4. Cada `git push` na branch `main` dispara um novo deploy automático, que já roda as migrations pendentes antes do build.

> No plano free do Render, o serviço "dorme" após 15 minutos sem acesso — a primeira requisição depois disso demora ~30-60s (cold start). Isso é esperado, não é erro.

## Próximos passos

Continue pelo roadmap em `PROJEXA-ARQUITETURA.md`, Fase 1 em diante (Clientes, Orçamentos/Propostas, Projetos, Financeiro, Documentos, Portal do Cliente).
