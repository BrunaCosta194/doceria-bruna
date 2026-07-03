// Dados de exemplo (mock) enquanto o Supabase não está conectado.
// Estrutura espelha o modelo de dados do spec (seção 3).

export const configuracoes = {
  desconto_1a_compra_pct: 10,
  whatsapp_bruna: "5599999999999",
  texto_versiculo:
    "Provai e vede que o Senhor é bom; bem-aventurado o homem que nele confia.",
  referencia_versiculo: "Salmos 34:8",
};

export const categorias = [
  { id: "cat-paes", nome: "Pães", ordem: 1, ativo: true },
  { id: "cat-bolos", nome: "Bolos", ordem: 2, ativo: true },
  { id: "cat-doces", nome: "Doces", ordem: 3, ativo: true },
  { id: "cat-caldos", nome: "Caldos", ordem: 4, ativo: true },
];

// Fotos: placeholders coloridos por gradiente (SVG data URI) — trocados por
// fotos reais do Storage depois. Cada produto tem um tom pastel próprio.
function foto(cor1, cor2, emoji) {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='800' height='800'>
    <defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
      <stop offset='0' stop-color='${cor1}'/><stop offset='1' stop-color='${cor2}'/>
    </linearGradient></defs>
    <rect width='800' height='800' fill='url(%23g)'/>
    <text x='50%' y='52%' font-size='260' text-anchor='middle' dominant-baseline='middle'>${emoji}</text>
  </svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg).replace(/%23/g, "#")}`;
}

export const produtos = [
  {
    id: "p-brioche",
    categoria_id: "cat-paes",
    nome: "Brioche caseiro",
    descricao:
      "Massa fofa e amanteigada, assada no dia. Perfeito para o café da manhã ou um lanche afetivo.",
    foto_url: foto("#f6d8d6", "#e8afab", "🍞"),
    preco_base: 18.0,
    ativo: true,
    sob_encomenda: false,
    antecedencia_dias: 0,
    variacoes: [
      { id: "v1", grupo: "Tamanho", nome: "Individual", preco_delta: 0 },
      { id: "v2", grupo: "Tamanho", nome: "Família", preco_delta: 12 },
    ],
  },
  {
    id: "p-pao-queijo",
    categoria_id: "cat-paes",
    nome: "Pão de queijo mineiro",
    descricao:
      "Crocante por fora, macio por dentro, com queijo de verdade. Vendido por porção.",
    foto_url: foto("#e2e7d7", "#b7c3a3", "🧀"),
    preco_base: 16.0,
    ativo: true,
    sob_encomenda: false,
    antecedencia_dias: 0,
    variacoes: [
      { id: "v3", grupo: "Porção", nome: "500g", preco_delta: 0 },
      { id: "v4", grupo: "Porção", nome: "1kg", preco_delta: 14 },
    ],
  },
  {
    id: "p-bolo-cenoura",
    categoria_id: "cat-bolos",
    nome: "Bolo de cenoura com chocolate",
    descricao:
      "Clássico da casa: massa de cenoura úmida com cobertura generosa de brigadeiro.",
    foto_url: foto("#f6d8d6", "#d1847e", "🍰"),
    preco_base: 45.0,
    ativo: true,
    sob_encomenda: true,
    antecedencia_dias: 2,
    variacoes: [
      { id: "v5", grupo: "Tamanho", nome: "Pequeno (12 fatias)", preco_delta: 0 },
      { id: "v6", grupo: "Tamanho", nome: "Grande (20 fatias)", preco_delta: 30 },
    ],
  },
  {
    id: "p-bolo-aniversario",
    categoria_id: "cat-bolos",
    nome: "Bolo de aniversário decorado",
    descricao:
      "Feito sob encomenda com o recheio da sua escolha e decoração delicada. Combine detalhes no checkout.",
    foto_url: foto("#e7e1ee", "#c9bedd", "🎂"),
    preco_base: 90.0,
    ativo: true,
    sob_encomenda: true,
    antecedencia_dias: 4,
    variacoes: [
      { id: "v7", grupo: "Recheio", nome: "Ninho com morango", preco_delta: 0 },
      { id: "v8", grupo: "Recheio", nome: "Brigadeiro gourmet", preco_delta: 10 },
      { id: "v9", grupo: "Recheio", nome: "Prestígio", preco_delta: 15 },
    ],
  },
  {
    id: "p-brigadeiro",
    categoria_id: "cat-doces",
    nome: "Caixa de brigadeiros gourmet",
    descricao:
      "Brigadeiros feitos à mão, com chocolate belga. Caixa com 12 unidades sortidas.",
    foto_url: foto("#f6d8d6", "#e8afab", "🍫"),
    preco_base: 32.0,
    ativo: true,
    sob_encomenda: false,
    antecedencia_dias: 0,
    variacoes: [],
  },
  {
    id: "p-caldo-verde",
    categoria_id: "cat-caldos",
    nome: "Caldo verde",
    descricao:
      "Caldo cremoso de batata com couve e calabresa. Conforto em pote, pronto para esquentar.",
    foto_url: foto("#e2e7d7", "#8fa07a", "🥣"),
    preco_base: 22.0,
    ativo: true,
    sob_encomenda: false,
    antecedencia_dias: 0,
    variacoes: [
      { id: "v10", grupo: "Tamanho", nome: "500ml", preco_delta: 0 },
      { id: "v11", grupo: "Tamanho", nome: "1 litro", preco_delta: 16 },
    ],
  },
];

export const zonasEntrega = [
  { id: "z1", nome_bairro: "Centro", valor_frete: 6, ativo: true },
  { id: "z2", nome_bairro: "Jardim das Flores", valor_frete: 9, ativo: true },
  { id: "z3", nome_bairro: "Vila Nova", valor_frete: 12, ativo: true },
  { id: "z4", nome_bairro: "Bairro Alto", valor_frete: 15, ativo: true },
];

export function produtoPorId(id) {
  return produtos.find((p) => p.id === id);
}

export function categoriaPorId(id) {
  return categorias.find((c) => c.id === id);
}
