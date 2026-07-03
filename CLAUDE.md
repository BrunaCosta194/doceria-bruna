# CLAUDE.md — Doceria da Bruna

Contexto para o Claude Code continuar este projeto. **Leia o spec completo antes
de implementar:** [`docs/specs/2026-07-02-doceria-design.md`](docs/specs/2026-07-02-doceria-design.md).

## O que é

E-commerce de uma doceria (pães, bolos, caldos etc.). O cliente vê o catálogo,
monta o pedido e finaliza pagando **na entrega** (pagamento online é fase 2).
Cadastro é **opcional** — quem se cadastra ganha desconto na 1ª compra. A dona,
**Bruna**, gerencia tudo por um painel próprio e é avisada de cada pedido por
WhatsApp.

Persona da Bruna: mulher evangélica. Identidade visual em **tons pastéis suaves**
com um **versículo bíblico discreto**. O visual **deve** ser feito com a skill
`frontend-design` (não deixar com "cara de IA").

## Stack

- **Frontend:** React + Vite (SPA), mobile-first
- **Backend:** Supabase — Postgres + Auth + Storage + Edge Functions
- **Automação/WhatsApp:** n8n + Evolution API (desacoplado do site)

## Estrutura de pastas (alvo)

```
doceria-bruna/
├── CLAUDE.md                 # este arquivo
├── docs/
│   └── specs/                # documento de design (fonte da verdade)
├── frontend/                 # app React + Vite (implementado)
│   └── src/
│       ├── loja/             # catálogo, produto, carrinho, checkout, confirmação
│       ├── conta/            # cadastro, login, meus pedidos
│       ├── painel/           # admin: produtos, zonas, pedidos, configurações
│       ├── componentes/      # design system pastel, versículo, compartilhados
│       └── lib/              # cliente supabase, helpers
└── supabase/
    ├── migrations/           # schema do banco (tabelas do spec, seção 3)
    └── functions/            # Edge Functions (criar-pedido, etc.)
```

## Estado atual (2026-07-02)

Fase 1 quase completa. Repo no GitHub (`BrunaCosta194/doceria-bruna`), deploy no
Vercel (Root Directory = `frontend`, rewrites de SPA em `frontend/vercel.json`).

**Pronto:**
- Loja React completa: catálogo, produto (variações + data de encomenda), carrinho
  (Context + localStorage), checkout (pagamento na entrega), confirmação.
- Design system pastel + versículo (Fraunces + Hanken Grotesk, grão SVG).
- Auth (login/cadastro opcional) — `conta/AuthContexto.jsx`, `conta/Entrar.jsx`.
- Painel da Bruna — `painel/`: pedidos (lista + detalhe + status), produtos (CRUD,
  variações, upload de foto), zonas de entrega, configurações. Protegido por
  `componentes/RotaProtegida.jsx` (`exigirAdmin`).
- Migrations Supabase: schema, RLS, seed, storage (`supabase/migrations/`).
- Edge Function `criar-pedido` (preço no servidor) em `supabase/functions/`.
- **Login com Google** (OAuth) além de email/senha — `entrarComGoogle` no
  `AuthContexto.jsx`, botão em `Entrar.jsx`, provider em `config.toml`. Trigger
  `handle_new_user()` pega o nome com fallback (`nome`/`full_name`/`name`).
- **Dois catálogos na loja** (`Catalogo.jsx`): "Do dia" (pronta entrega,
  `sob_encomenda=false`) e "Encomenda" (`sob_encomenda=true`), com `?modo=encomenda`.
- **Confirmação de encomenda:** pedido com item sob encomenda nasce
  `aguardando_confirmacao`; a Bruna confirma/recusa no painel. Pronta entrega nasce `novo`.
- **Fallback mock:** sem as chaves do Supabase o site roda com `lib/dados-exemplo.js`
  (loja funciona; auth/painel mostram "Supabase não conectado"). Flag:
  `supabaseConfigurado` em `lib/supabase.js`.
- Specs em `docs/specs/`: design principal + `2026-07-02-login-google-e-catalogos.md`.

**Próximos passos:**
1. **Conectar o Supabase** (estava fora do ar): rodar as migrations, setar
   `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` no Vercel (nunca a service_role).
2. **Habilitar Google OAuth:** criar credenciais no Google Cloud, ligar o provider no
   painel do Supabase e configurar `SUPABASE_AUTH_GOOGLE_CLIENT_ID/SECRET`.
3. **Criar admin:** Bruna se cadastra pelo site; marcar `perfis.papel = 'admin'`.
4. **Deploy da Edge Function** `criar-pedido` com secrets (service role, `N8N_WEBHOOK_URL`).
5. **WhatsApp:** montar o fluxo n8n + Evolution API que consome o webhook do pedido
   (payload já inclui `status` e `tem_encomenda`).
6. **Testar ponta a ponta:** pedido logado e como visitante, desconto de 1ª compra,
   encomenda aguardando confirmação, pedido aparecendo no painel.

## Regras importantes (não violar)

- **Preço é calculado no servidor** (Edge Function `criar-pedido`), nunca confiando
  no total vindo do navegador.
- **Desconto de 1ª compra** só se `perfis.desconto_1a_compra_usado = false`,
  verificado no servidor.
- Itens do pedido guardam **snapshot** de nome/preço/variações (histórico imutável).
- Segredos (chaves do Supabase service role, Evolution API) **nunca** no frontend —
  só em Edge Functions / n8n.
- Notificação de WhatsApp é **assíncrona**: gravar o pedido primeiro; se o webhook
  falhar, o pedido continua válido.

## Escopo

- **Fase 1 (MVP):** catálogo + variações + encomenda com data, carrinho, checkout
  (pagamento na entrega), frete por zona, cadastro opcional + desconto, painel da
  Bruna, aviso por WhatsApp, visual pastel + versículo.
- **Fase 2:** pagamento online (ex: Mercado Pago), remarketing automatizado.
- **Fora de escopo:** app nativo, fidelidade/pontos, múltiplas lojas.

## Convenções

- Código e UI em **português (pt-BR)**.
- Componentes pequenos e focados; um arquivo, uma responsabilidade.
- Seguir a direção visual do spec (seção 5) e usar a skill `frontend-design`.
