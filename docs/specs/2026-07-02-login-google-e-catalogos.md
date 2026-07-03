# Doceria da Bruna — Login Google, dois catálogos e confirmação de encomenda

> **Status:** aprovado · **Data:** 2026-07-02
> **Cliente:** Bruna (dona da doceria)
> **Dev:** Bruna Costa (full-stack)
> Complementa o spec principal [`2026-07-02-doceria-design.md`](./2026-07-02-doceria-design.md).

Três melhorias na Fase 1 já implementada:

1. **Login com Google** — o cliente que quiser se cadastrar (e ficar no banco para
   ganhar desconto e acompanhar pedidos) pode entrar com a conta Google, sem criar
   senha.
2. **Dois catálogos na loja** — separar **"Do dia"** (pronta entrega, imediato) de
   **"Encomenda"** (com data escolhida pelo cliente).
3. **Confirmação de encomenda** — pedidos de encomenda entram como *Aguardando
   confirmação* e só seguem o fluxo depois que a Bruna confirmar (ou recusar).

---

## 1. Onde a Bruna atualiza o catálogo (esclarecimento)

Já existe e não muda: **Painel → Produtos** (`/painel/produtos`). Lá a Bruna cria,
edita e exclui produtos. Dois toggles controlam onde o produto aparece:

| Toggle | Significado |
|--------|-------------|
| **Ativo** | Aparece na loja (ligar/desligar sem apagar o produto). |
| **Sob encomenda** | Se ligado, o produto vai para o catálogo **Encomenda** (pede data). Se desligado, vai para o **Catálogo do Dia** (pronta entrega). |

O "Catálogo do Dia" é **liga/desliga** por produto — não há controle de quantidade
ou estoque diário nesta fase. Para tirar um item do dia, basta desligar **Ativo**.

---

## 2. Login com Google

### Experiência
Na tela **Entrar / Criar conta** (`/entrar`), acima do formulário de email/senha,
um botão **"Continuar com Google"** e uma divisória "ou". Email/senha continua
funcionando normalmente — o Google é uma opção a mais, não substituição.

### Como funciona
- `supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: <origem> }})`
  redireciona para o Google; ao voltar, o `onAuthStateChange` já existente captura a
  sessão e o app carrega o perfil normalmente.
- O perfil (`perfis`) é criado automaticamente pelo trigger `handle_new_user()`. Como
  o Google envia o nome em `full_name`/`name` (e não em `nome`), o trigger passa a usar:
  `coalesce(raw_user_meta_data->>'nome', raw_user_meta_data->>'full_name', raw_user_meta_data->>'name')`.

### Configuração necessária (fora do código — a Bruna/dev faz uma vez)
1. No **Google Cloud Console**: criar credenciais OAuth 2.0 (Client ID + Secret),
   com a **Authorized redirect URI** apontando para
   `https://<projeto>.supabase.co/auth/v1/callback`.
2. No **painel do Supabase → Authentication → Providers → Google**: habilitar e colar
   Client ID + Secret.
3. Adicionar a URL do site (Vercel) em **Redirect URLs** do Supabase.

Sem esse setup o botão aparece, mas o login Google não completa (email/senha segue ok).

---

## 3. Dois catálogos na loja

### Experiência
Na home, acima dos filtros de categoria, um seletor de **modo**:

- **Do dia** (padrão) — mostra só produtos de pronta entrega (`sob_encomenda = false`).
  Chamada: "feito no dia, pronto para levar".
- **Encomenda** — mostra só produtos `sob_encomenda = true`. Chamada: "encomende com
  antecedência e escolha a data".

O filtro por categoria (Pães, Bolos, Doces, Caldos) continua funcionando **dentro** de
cada modo. O modo pode vir por link direto via `?modo=encomenda`.

O restante do fluxo (produto, carrinho, checkout) não muda: produtos de encomenda já
mostram o seletor de data e validam a antecedência; pronta entrega não pede data.

### Modelo de dados
Nenhuma mudança — a distinção já é o campo `produtos.sob_encomenda`.

---

## 4. Confirmação de encomenda

### Fluxo
```
Pedido só com pronta entrega   →  Recebido (novo)  →  Confirmado  →  Em preparo  → ...
Pedido com item de encomenda   →  Aguardando confirmação
                                     ↳ Bruna: Confirmar  →  Confirmado  →  Em preparo → ...
                                     ↳ Bruna: Recusar    →  Cancelado
```

Um pedido é tratado como encomenda se **qualquer** item for `sob_encomenda`.

### Modelo de dados
Adicionar o valor `'aguardando_confirmacao'` ao `check` de `pedidos.status`. Demais
status seguem iguais (`novo, confirmado, em_preparo, a_caminho, entregue, cancelado`).

### Servidor (`criar-pedido`)
O status inicial passa de fixo `'novo'` para:
`temEncomenda ? 'aguardando_confirmacao' : 'novo'`. O payload do webhook do n8n ganha
`status` e `tem_encomenda`, para a mensagem de WhatsApp diferenciar "novo pedido" de
"nova encomenda para confirmar".

### Painel da Bruna
Na lista de Pedidos, novo chip de filtro **Aguardando confirmação** e o selo
correspondente. No detalhe do pedido, quando estiver aguardando, aparecem os botões
**Confirmar** (→ `confirmado`) e **Recusar** (→ `cancelado`), além do seletor de status.

### Cliente (Meus pedidos)
O selo do pedido mostra **"Aguardando confirmação"** até a Bruna decidir.

---

## 5. Telas afetadas

| Tela | Mudança |
|------|---------|
| Entrar (`/entrar`) | Botão "Continuar com Google" + divisória. |
| Catálogo (home) | Seletor de modo Do dia / Encomenda. |
| Painel · Pedidos | Filtro + selo + botões Confirmar/Recusar de encomenda. |
| Meus pedidos | Rótulo do status "Aguardando confirmação". |

---

## 6. Critérios de aceite

- [ ] Botão Google aparece em `/entrar`; com o provider configurado, loga e cria o
      perfil com o nome vindo do Google.
- [ ] Home alterna entre "Do dia" e "Encomenda" mostrando só os produtos certos; filtro
      de categoria funciona dentro de cada modo.
- [ ] Pedido com item de encomenda nasce como *Aguardando confirmação*; pronta entrega
      nasce como *Recebido*.
- [ ] No painel, Confirmar leva a *Confirmado* e Recusar a *Cancelado*.
- [ ] "Meus pedidos" exibe o selo *Aguardando confirmação*.
- [ ] `npm run build` e `npm run lint` sem erros novos.

---

## 7. Fora de escopo (fica para depois)

- Estoque/quantidade diária no Catálogo do Dia (hoje é só liga/desliga).
- Outros provedores sociais (Facebook, Apple).
- Data por item no mesmo pedido (hoje o pedido guarda uma data de encomenda).
