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
├── frontend/                 # app React + Vite (a criar — ver "Como começar")
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

## Como começar (primeiros passos de implementação)

1. Rodar a skill **`writing-plans`** para gerar o plano de implementação a partir
   do spec (recomendado antes de codar).
2. Scaffold do frontend: `npm create vite@latest frontend -- --template react`
   e instalar `@supabase/supabase-js`.
3. Criar projeto no Supabase; escrever as migrations com as tabelas da seção 3 do
   spec; ligar Auth e Storage (bucket para fotos de produto).
4. Configurar **RLS**: cliente só vê os próprios pedidos; painel exige papel `admin`.
5. Implementar a Fase 1 (MVP) conforme a seção 6 do spec.

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
