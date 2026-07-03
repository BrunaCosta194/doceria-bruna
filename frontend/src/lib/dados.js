// Camada de acesso a dados. Usa o Supabase quando configurado; caso
// contrário, cai nos dados de exemplo — assim o app roda em qualquer estado.
import { supabase, supabaseConfigurado } from "./supabase";
import * as mock from "./dados-exemplo";

function montarProdutos(produtos, variacoes) {
  const porProduto = {};
  for (const v of variacoes ?? []) {
    (porProduto[v.produto_id] ??= []).push(v);
  }
  return produtos.map((p) => ({ ...p, variacoes: porProduto[p.id] ?? [] }));
}

export async function carregarCatalogo() {
  if (!supabaseConfigurado) {
    return { categorias: mock.categorias, produtos: mock.produtos };
  }
  const [{ data: categorias }, { data: produtos }, { data: variacoes }] =
    await Promise.all([
      supabase.from("categorias").select("*").eq("ativo", true).order("ordem"),
      supabase.from("produtos").select("*").eq("ativo", true).order("criado_em"),
      supabase.from("variacoes").select("*"),
    ]);
  return {
    categorias: categorias ?? [],
    produtos: montarProdutos(produtos ?? [], variacoes),
  };
}

export async function carregarProduto(id) {
  if (!supabaseConfigurado) return mock.produtoPorId(id) ?? null;
  const { data: produto } = await supabase
    .from("produtos")
    .select("*")
    .eq("id", id)
    .single();
  if (!produto) return null;
  const { data: variacoes } = await supabase
    .from("variacoes")
    .select("*")
    .eq("produto_id", id);
  return { ...produto, variacoes: variacoes ?? [] };
}

export async function carregarZonas() {
  if (!supabaseConfigurado) return mock.zonasEntrega;
  const { data } = await supabase
    .from("zonas_entrega")
    .select("*")
    .eq("ativo", true)
    .order("valor_frete");
  return data ?? [];
}

export async function carregarConfiguracoes() {
  if (!supabaseConfigurado) return mock.configuracoes;
  const { data } = await supabase
    .from("configuracoes")
    .select("*")
    .eq("id", 1)
    .single();
  return data ?? mock.configuracoes;
}

export async function carregarCategoria(id) {
  if (!supabaseConfigurado) return mock.categoriaPorId(id) ?? null;
  const { data } = await supabase
    .from("categorias")
    .select("*")
    .eq("id", id)
    .single();
  return data ?? null;
}
