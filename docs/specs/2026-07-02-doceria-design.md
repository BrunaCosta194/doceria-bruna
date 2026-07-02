# Doceria da Bruna — Documento de Design (Spec)

> **Status:** aprovado na estrutura principal · **Data:** 2026-07-02
> **Cliente:** Bruna (dona da doceria — nome e logo ainda a definir)
> **Dev:** Bruna Costa (full-stack)

Sistema de e-commerce para uma doceria: catálogo de produtos (pães, bolos,
caldos etc.) com foto e preço, pedidos online com pagamento na entrega (pagamento
online numa fase seguinte), frete por região, cadastro opcional com desconto, e
painel de gestão para a dona. Persona: mulher evangélica — identidade visual em
**tons pastéis, suave e delicada**, com um **versículo bíblico** discreto no site.

---

## 1. Decisões tomadas (brainstorm)

| Tema | Decisão |
|------|---------|
| Plataforma | Site responsivo (web), mobile-first |
| Frontend | **React + Vite** (SPA) |
| Backend | **Supabase** (Postgres + Auth + Storage) + **Edge Functions** para lógica sensível |
| Automação | **n8n + Evolution API** (WhatsApp), desacoplado do site |
| Pagamento | **Na entrega** no MVP; checkout já preparado para gateway online (fase 2) |
| Gestão | **Painel próprio** dentro do site, protegido por login (só a Bruna) |
| Aviso de pedido | **WhatsApp** para a Bruna a cada pedido novo |
| Frete | **Por bairro/região** — Bruna cadastra faixas (bairro → valor) |
| Cadastro | **Opcional** — comprar como convidado OU cadastrar e ganhar desconto |
| Desconto | **Na 1ª compra** para quem se cadastra (% definida pela Bruna) |
| Produtos | **Variações** (tamanho/sabor/recheio que mudam o preço) **+ encomenda com data** |

---

## 2. Arquitetura

```
┌─────────────────────────── React + Vite (SPA) ───────────────────────────┐
│  🛍️ Loja            👤 Conta              🔒 Painel (admin, protegido)     │
│  catálogo, produto  cadastro/login       produtos, zonas de frete,        │
│  carrinho, checkout meus pedidos         pedidos, configurações           │
└──────────────┬───────────────────────────────────┬───────────────────────┘
               │ supabase-js (Auth + queries + RLS) │ chamadas às Edge Functions
               ▼                                     ▼
        ┌──────────────────── Supabase ────────────────────┐
        │  Postgres (dados)  ·  Auth (login)  ·  Storage    │
        │  Edge Functions: criar-pedido, (fase 2) pagamento │
        └───────────────────────┬──────────────────────────┘
                                 │ webhook (pedido criado)
                                 ▼
                    ┌──────────── n8n ────────────┐
                    │ Evolution API → WhatsApp     │
                    │ (aviso Bruna · fase 2:       │
                    │  remarketing)                │
                    └──────────────────────────────┘
```

**Princípio de segurança:** o navegador nunca é fonte de verdade de preço. A Edge
Function `criar-pedido` recalcula subtotal, frete e desconto no servidor a partir
dos IDs enviados, grava o pedido e dispara o webhook do n8n. RLS (Row Level
Security) protege os dados: cliente só vê os próprios pedidos; painel exige papel
`admin`.

---

## 3. Modelo de dados (Postgres / Supabase)

- **categorias** — `id, nome, ordem, ativo`
- **produtos** — `id, categoria_id, nome, descricao, foto_url, preco_base,
  ativo, sob_encomenda (bool), antecedencia_dias`
- **variacoes** — `id, produto_id, grupo (ex: "Tamanho"), nome (ex: "G"),
  preco_delta` (soma/subtrai do preço-base)
- **zonas_entrega** — `id, nome_bairro, valor_frete, ativo`
- **perfis** — `id (= auth.users.id), nome, telefone, endereco,
  desconto_1a_compra_usado (bool), criado_em`
- **pedidos** — `id, cliente_id (nullable p/ convidado), nome_contato, telefone,
  tipo_entrega (entrega|retirada), zona_id, endereco, frete_valor, subtotal,
  desconto_valor, total, forma_pagamento (entrega|online), status
  (novo|confirmado|em_preparo|a_caminho|entregue|cancelado), data_encomenda
  (nullable), observacoes, criado_em`
- **itens_pedido** — `id, pedido_id, produto_id, nome_snapshot, variacoes_snapshot
  (json), qtd, preco_unit, subtotal`
- **configuracoes** — linha única: `desconto_1a_compra_pct, whatsapp_bruna,
  texto_versiculo, ...`

> `*_snapshot` guardam nome/preço/variações no momento da compra, para o histórico
> não mudar se o produto for editado depois.

---

## 4. Telas / navegação

**Loja (público)**
1. **Home / Catálogo** — vitrine por categoria, cada card com foto, nome e preço
2. **Produto** — foto, descrição, seleção de variações (preço atualiza), e
   seletor de **data** quando for sob encomenda; botão "adicionar ao carrinho"
3. **Carrinho** — itens, quantidades, subtotal
4. **Checkout** — dados de contato, entrega (zona → frete) ou retirada, forma de
   pagamento (por ora: na entrega), e **cadastro opcional** ("cadastre-se e ganhe
   X% na 1ª compra")
5. **Confirmação** — resumo do pedido + mensagem calorosa (bom lugar p/ o versículo)

**Conta (cliente cadastrado)**
6. **Cadastro / Login** (Supabase Auth)
7. **Meus pedidos** — histórico

**Painel (só Bruna, protegido)**
8. **Login admin**
9. **Pedidos** — lista + detalhe, mudar status
10. **Produtos** — CRUD com upload de foto (Storage) e variações
11. **Zonas de entrega** — CRUD bairro → valor do frete
12. **Configurações** — % do desconto, WhatsApp, texto do versículo

---

## 5. Direção visual

Identidade em **tons pastéis suaves** — rosa-claro, creme, lavanda, verde-sálvia.
Cantos arredondados, sombras leves, respiro generoso. Títulos com uma serifada
delicada (ar artesanal/afetivo) + sans limpa no corpo. **Versículo bíblico**
discreto no rodapé (itálico suave) e opcionalmente na tela de confirmação do pedido
— nunca gritante.

> **Importante:** a identidade visual final deve ser trabalhada com a skill
> **`frontend-design`** (e apoio da `brandkit` para logo/paleta) durante a
> implementação, para fugir de "cara de IA". Este spec define só a direção.

---

## 6. Fases de entrega

**Fase 1 — MVP (foco)**
- Catálogo com categorias, variações e itens sob encomenda (com data)
- Carrinho + checkout com **pagamento na entrega**
- Frete por zona (bairro → valor)
- Cadastro opcional + desconto de 1ª compra
- Painel da Bruna: produtos, zonas, pedidos (status), configurações
- Aviso de pedido novo por **WhatsApp** (n8n + Evolution API)
- Identidade visual pastel + versículo

**Fase 2 — depois**
- Pagamento **online** (gateway a definir — ex: Mercado Pago) na Edge Function
- **Remarketing** automatizado (n8n lê histórico e reoferece via WhatsApp)
- Possíveis extras: cupons manuais, avaliações, relatórios de vendas

---

## 7. Tratamento de erros (pontos de atenção)

- **Preço divergente:** Edge Function recalcula; se o total do cliente não bater,
  retorna erro e pede para revisar o carrinho.
- **Produto/variação inativos ou esgotados** no momento do checkout → bloquear.
- **Encomenda com data inválida** (menor que a antecedência) → validar no servidor.
- **Desconto de 1ª compra** só aplica se `desconto_1a_compra_usado = false`
  (verificado no servidor, nunca só no front).
- **Falha no webhook do WhatsApp** não pode derrubar o pedido: pedido é gravado
  primeiro; notificação é assíncrona e com retry no n8n.

---

## 8. Testes

- **Unitário:** cálculo de total (subtotal + variações + frete − desconto) na Edge
  Function; regras de desconto e de antecedência de encomenda.
- **Integração:** fluxo criar-pedido (convidado e cadastrado); RLS (cliente não vê
  pedido de outro; não-admin não acessa painel).
- **E2E (feliz):** cliente monta pedido → checkout → confirmação; Bruna vê pedido
  no painel e recebe WhatsApp.

---

## 9. Fora de escopo (por ora)

- App nativo (Play/App Store)
- Pagamento online (fase 2)
- Programa de pontos/fidelidade
- Múltiplas lojas/vendedores
