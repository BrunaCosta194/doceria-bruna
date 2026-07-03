export function moeda(valor) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor ?? 0);
}

export function precoComVariacoes(produto, variacoesSelecionadas = {}) {
  const deltas = Object.values(variacoesSelecionadas).reduce(
    (soma, v) => soma + (v?.preco_delta ?? 0),
    0
  );
  return produto.preco_base + deltas;
}

// Agrupa as variações de um produto por "grupo" (ex.: Tamanho, Recheio).
export function agruparVariacoes(variacoes = []) {
  return variacoes.reduce((acc, v) => {
    (acc[v.grupo] ??= []).push(v);
    return acc;
  }, {});
}
