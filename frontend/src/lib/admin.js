// Operações do painel (exigem sessão de admin — o RLS garante no servidor).
import { supabase } from "./supabase";

// ── Pedidos ──
export async function listarPedidos() {
  const { data, error } = await supabase
    .from("pedidos")
    .select("*, itens_pedido(*), zonas_entrega(nome_bairro)")
    .order("criado_em", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function atualizarStatusPedido(id, status) {
  const { error } = await supabase
    .from("pedidos")
    .update({ status })
    .eq("id", id);
  if (error) throw error;
}

// ── Produtos (inclui inativos — só admin enxerga) ──
export async function listarProdutosAdmin() {
  const [{ data: produtos, error }, { data: variacoes }] = await Promise.all([
    supabase.from("produtos").select("*").order("criado_em"),
    supabase.from("variacoes").select("*"),
  ]);
  if (error) throw error;
  const porProduto = {};
  for (const v of variacoes ?? []) {
    (porProduto[v.produto_id] ??= []).push(v);
  }
  return (produtos ?? []).map((p) => ({
    ...p,
    variacoes: porProduto[p.id] ?? [],
  }));
}

export async function salvarProduto(produto, variacoes) {
  const registro = {
    categoria_id: produto.categoria_id || null,
    nome: produto.nome,
    descricao: produto.descricao || null,
    foto_url: produto.foto_url || null,
    preco_base: Number(produto.preco_base) || 0,
    ativo: produto.ativo,
    sob_encomenda: produto.sob_encomenda,
    antecedencia_dias: Number(produto.antecedencia_dias) || 0,
  };
  if (produto.id) registro.id = produto.id;

  const { data: salvo, error } = await supabase
    .from("produtos")
    .upsert(registro)
    .select()
    .single();
  if (error) throw error;

  // Sincroniza as variações: apaga as antigas e insere as atuais.
  await supabase.from("variacoes").delete().eq("produto_id", salvo.id);
  const limpas = (variacoes ?? []).filter((v) => v.grupo && v.nome);
  if (limpas.length) {
    const { error: erroVar } = await supabase.from("variacoes").insert(
      limpas.map((v) => ({
        produto_id: salvo.id,
        grupo: v.grupo,
        nome: v.nome,
        preco_delta: Number(v.preco_delta) || 0,
      }))
    );
    if (erroVar) throw erroVar;
  }
  return salvo;
}

export async function excluirProduto(id) {
  const { error } = await supabase.from("produtos").delete().eq("id", id);
  if (error) throw error;
}

// ── Categorias ──
export async function listarCategoriasAdmin() {
  const { data } = await supabase.from("categorias").select("*").order("ordem");
  return data ?? [];
}

// ── Zonas de entrega ──
export async function listarZonasAdmin() {
  const { data } = await supabase
    .from("zonas_entrega")
    .select("*")
    .order("valor_frete");
  return data ?? [];
}

export async function salvarZona(zona) {
  const registro = {
    nome_bairro: zona.nome_bairro,
    valor_frete: Number(zona.valor_frete) || 0,
    ativo: zona.ativo ?? true,
  };
  if (zona.id) registro.id = zona.id;
  const { error } = await supabase.from("zonas_entrega").upsert(registro);
  if (error) throw error;
}

export async function excluirZona(id) {
  const { error } = await supabase.from("zonas_entrega").delete().eq("id", id);
  if (error) throw error;
}

// ── Configurações ──
export async function salvarConfiguracoes(config) {
  const { error } = await supabase
    .from("configuracoes")
    .update({
      desconto_1a_compra_pct: Number(config.desconto_1a_compra_pct) || 0,
      whatsapp_bruna: config.whatsapp_bruna || null,
      texto_versiculo: config.texto_versiculo || null,
      referencia_versiculo: config.referencia_versiculo || null,
      atualizado_em: new Date().toISOString(),
    })
    .eq("id", 1);
  if (error) throw error;
}

// ── Upload de foto (Storage: bucket "produtos") ──
export async function enviarFotoProduto(file) {
  const ext = file.name.split(".").pop();
  const caminho = `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from("produtos")
    .upload(caminho, file, { cacheControl: "3600", upsert: false });
  if (error) throw error;
  const { data } = supabase.storage.from("produtos").getPublicUrl(caminho);
  return data.publicUrl;
}

// ── Meus pedidos (cliente logado) ──
export async function listarMeusPedidos() {
  const { data, error } = await supabase
    .from("pedidos")
    .select("*, itens_pedido(*)")
    .order("criado_em", { ascending: false });
  if (error) throw error;
  return data ?? [];
}
