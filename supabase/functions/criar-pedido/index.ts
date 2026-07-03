// ============================================================
// Edge Function: criar-pedido
// Fonte de verdade do preço. Recalcula subtotal, frete e desconto
// no servidor a partir dos IDs enviados, grava o pedido e dispara
// o webhook do n8n (assíncrono — falha dele não derruba o pedido).
// ============================================================

import { createClient } from "jsr:@supabase/supabase-js@2";
import { corsHeaders, json } from "../_shared/cors.ts";

interface ItemEntrada {
  produto_id: string;
  variacao_ids?: string[];
  qtd: number;
  data_encomenda?: string | null;
}

interface Corpo {
  itens: ItemEntrada[];
  contato: { nome: string; telefone: string; endereco?: string };
  tipo_entrega: "entrega" | "retirada";
  zona_id?: string | null;
  observacoes?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return json({ erro: "Método não permitido" }, 405);
  }

  const url = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

  // Cliente com o JWT do usuário (se logado) — só para descobrir quem é.
  const authHeader = req.headers.get("Authorization") ?? "";
  const supabaseUsuario = createClient(url, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const {
    data: { user },
  } = await supabaseUsuario.auth.getUser();
  const clienteId = user?.id ?? null;

  // Cliente admin (service_role) para ler preços e gravar — ignora RLS.
  const db = createClient(url, serviceKey);

  let corpo: Corpo;
  try {
    corpo = await req.json();
  } catch {
    return json({ erro: "Corpo inválido" }, 400);
  }

  if (!corpo?.itens?.length) {
    return json({ erro: "O carrinho está vazio." }, 400);
  }
  if (!corpo.contato?.nome?.trim() || !corpo.contato?.telefone?.trim()) {
    return json({ erro: "Informe nome e telefone." }, 400);
  }

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  // — Recalcula cada item a partir do banco —
  const itensGravar: {
    produto_id: string;
    nome_snapshot: string;
    variacoes_snapshot: unknown;
    qtd: number;
    preco_unit: number;
    subtotal: number;
    data_encomenda: string | null;
  }[] = [];
  let subtotal = 0;
  let temEncomenda = false;

  for (const item of corpo.itens) {
    const qtd = Math.floor(Number(item.qtd));
    if (!qtd || qtd < 1) return json({ erro: "Quantidade inválida." }, 400);

    const { data: produto } = await db
      .from("produtos")
      .select("id, nome, preco_base, ativo, sob_encomenda, antecedencia_dias")
      .eq("id", item.produto_id)
      .single();

    if (!produto || !produto.ativo) {
      return json(
        { erro: "Um dos produtos não está mais disponível." },
        409,
      );
    }

    // Variações: precisam pertencer ao produto.
    let deltas = 0;
    const varSnapshot: { grupo: string; nome: string; preco_delta: number }[] =
      [];
    const varIds = item.variacao_ids ?? [];
    if (varIds.length) {
      const { data: variacoes } = await db
        .from("variacoes")
        .select("id, grupo, nome, preco_delta, produto_id")
        .in("id", varIds);

      if (!variacoes || variacoes.length !== varIds.length) {
        return json({ erro: "Variação inválida." }, 409);
      }
      for (const v of variacoes) {
        if (v.produto_id !== produto.id) {
          return json({ erro: "Variação não pertence ao produto." }, 409);
        }
        deltas += Number(v.preco_delta);
        varSnapshot.push({
          grupo: v.grupo,
          nome: v.nome,
          preco_delta: Number(v.preco_delta),
        });
      }
    }

    // Encomenda: valida antecedência.
    let dataEncomenda: string | null = null;
    if (produto.sob_encomenda) {
      temEncomenda = true;
      if (!item.data_encomenda) {
        return json(
          { erro: `Escolha a data de entrega para "${produto.nome}".` },
          400,
        );
      }
      const dt = new Date(item.data_encomenda + "T00:00:00");
      const minimo = new Date(hoje);
      minimo.setDate(minimo.getDate() + produto.antecedencia_dias);
      if (dt < minimo) {
        return json(
          {
            erro: `"${produto.nome}" precisa de ${produto.antecedencia_dias} dia(s) de antecedência.`,
          },
          400,
        );
      }
      dataEncomenda = item.data_encomenda;
    }

    const precoUnit = Number(produto.preco_base) + deltas;
    const subItem = precoUnit * qtd;
    subtotal += subItem;

    itensGravar.push({
      produto_id: produto.id,
      nome_snapshot: produto.nome,
      variacoes_snapshot: varSnapshot,
      qtd,
      preco_unit: precoUnit,
      subtotal: subItem,
      data_encomenda: dataEncomenda,
    });
  }

  // — Frete —
  let freteValor = 0;
  if (corpo.tipo_entrega === "entrega") {
    if (!corpo.zona_id) return json({ erro: "Selecione o bairro." }, 400);
    if (!corpo.contato.endereco?.trim()) {
      return json({ erro: "Informe o endereço de entrega." }, 400);
    }
    const { data: zona } = await db
      .from("zonas_entrega")
      .select("id, valor_frete, ativo")
      .eq("id", corpo.zona_id)
      .single();
    if (!zona || !zona.ativo) {
      return json({ erro: "Bairro indisponível para entrega." }, 409);
    }
    freteValor = Number(zona.valor_frete);
  }

  // — Desconto de 1ª compra (só cliente cadastrado, verificado no servidor) —
  let descontoValor = 0;
  let aplicarDesconto = false;
  if (clienteId) {
    const { data: perfil } = await db
      .from("perfis")
      .select("desconto_1a_compra_usado")
      .eq("id", clienteId)
      .single();
    if (perfil && !perfil.desconto_1a_compra_usado) {
      const { data: config } = await db
        .from("configuracoes")
        .select("desconto_1a_compra_pct")
        .eq("id", 1)
        .single();
      const pct = Number(config?.desconto_1a_compra_pct ?? 0);
      descontoValor = Math.round(subtotal * pct) / 100;
      aplicarDesconto = descontoValor > 0;
    }
  }

  const total = Math.max(0, subtotal + freteValor - descontoValor);

  // Encomenda espera a Bruna confirmar; pronta entrega já entra como "novo".
  const statusInicial = temEncomenda ? "aguardando_confirmacao" : "novo";

  // — Grava o pedido —
  const { data: pedido, error: erroPedido } = await db
    .from("pedidos")
    .insert({
      cliente_id: clienteId,
      nome_contato: corpo.contato.nome.trim(),
      telefone: corpo.contato.telefone.trim(),
      tipo_entrega: corpo.tipo_entrega,
      zona_id: corpo.tipo_entrega === "entrega" ? corpo.zona_id : null,
      endereco:
        corpo.tipo_entrega === "entrega" ? corpo.contato.endereco?.trim() : null,
      frete_valor: freteValor,
      subtotal,
      desconto_valor: descontoValor,
      total,
      forma_pagamento: "entrega",
      status: statusInicial,
      data_encomenda: itensGravar.find((i) => i.data_encomenda)?.data_encomenda ??
        null,
      observacoes: corpo.observacoes?.trim() || null,
    })
    .select("id, numero, total, subtotal, frete_valor, desconto_valor, criado_em")
    .single();

  if (erroPedido || !pedido) {
    return json({ erro: "Não foi possível gravar o pedido." }, 500);
  }

  const { error: erroItens } = await db.from("itens_pedido").insert(
    itensGravar.map((i) => ({
      pedido_id: pedido.id,
      produto_id: i.produto_id,
      nome_snapshot: i.nome_snapshot,
      variacoes_snapshot: i.variacoes_snapshot,
      qtd: i.qtd,
      preco_unit: i.preco_unit,
      subtotal: i.subtotal,
    })),
  );

  if (erroItens) {
    // Reverte o pedido para não deixar registro órfão.
    await db.from("pedidos").delete().eq("id", pedido.id);
    return json({ erro: "Não foi possível gravar os itens do pedido." }, 500);
  }

  // Marca o desconto como usado (não bloqueia o pedido em caso de falha).
  if (aplicarDesconto && clienteId) {
    await db
      .from("perfis")
      .update({ desconto_1a_compra_usado: true })
      .eq("id", clienteId);
  }

  // — Webhook do n8n: assíncrono e tolerante a falha —
  const webhook = Deno.env.get("N8N_WEBHOOK_URL");
  if (webhook) {
    try {
      await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pedido_id: pedido.id,
          numero: pedido.numero,
          nome: corpo.contato.nome,
          telefone: corpo.contato.telefone,
          total,
          tipo_entrega: corpo.tipo_entrega,
          status: statusInicial,
          tem_encomenda: temEncomenda,
        }),
      });
    } catch (e) {
      console.error("Falha ao chamar webhook do n8n:", e);
    }
  }

  return json({
    pedido: {
      id: pedido.id,
      numero: pedido.numero,
      subtotal,
      frete_valor: freteValor,
      desconto_valor: descontoValor,
      total,
      criado_em: pedido.criado_em,
    },
  });
});
