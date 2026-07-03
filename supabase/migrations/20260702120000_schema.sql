-- ============================================================
-- Doceria da Bruna — Schema (seção 3 do spec)
-- ============================================================

create extension if not exists "pgcrypto";

-- — Categorias —
create table if not exists public.categorias (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  ordem int not null default 0,
  ativo boolean not null default true,
  criado_em timestamptz not null default now()
);

-- — Produtos —
create table if not exists public.produtos (
  id uuid primary key default gen_random_uuid(),
  categoria_id uuid references public.categorias (id) on delete set null,
  nome text not null,
  descricao text,
  foto_url text,
  preco_base numeric(10, 2) not null check (preco_base >= 0),
  ativo boolean not null default true,
  sob_encomenda boolean not null default false,
  antecedencia_dias int not null default 0 check (antecedencia_dias >= 0),
  criado_em timestamptz not null default now()
);
create index if not exists idx_produtos_categoria on public.produtos (categoria_id);

-- — Variações (somam/subtraem do preço-base) —
create table if not exists public.variacoes (
  id uuid primary key default gen_random_uuid(),
  produto_id uuid not null references public.produtos (id) on delete cascade,
  grupo text not null,
  nome text not null,
  preco_delta numeric(10, 2) not null default 0
);
create index if not exists idx_variacoes_produto on public.variacoes (produto_id);

-- — Zonas de entrega (bairro → frete) —
create table if not exists public.zonas_entrega (
  id uuid primary key default gen_random_uuid(),
  nome_bairro text not null,
  valor_frete numeric(10, 2) not null check (valor_frete >= 0),
  ativo boolean not null default true
);

-- — Perfis (1:1 com auth.users) —
create table if not exists public.perfis (
  id uuid primary key references auth.users (id) on delete cascade,
  nome text,
  telefone text,
  endereco text,
  papel text not null default 'cliente' check (papel in ('cliente', 'admin')),
  desconto_1a_compra_usado boolean not null default false,
  criado_em timestamptz not null default now()
);

-- — Pedidos —
create table if not exists public.pedidos (
  id uuid primary key default gen_random_uuid(),
  numero bigint generated always as identity,
  cliente_id uuid references auth.users (id) on delete set null,
  nome_contato text not null,
  telefone text not null,
  tipo_entrega text not null check (tipo_entrega in ('entrega', 'retirada')),
  zona_id uuid references public.zonas_entrega (id) on delete set null,
  endereco text,
  frete_valor numeric(10, 2) not null default 0,
  subtotal numeric(10, 2) not null,
  desconto_valor numeric(10, 2) not null default 0,
  total numeric(10, 2) not null,
  forma_pagamento text not null default 'entrega' check (forma_pagamento in ('entrega', 'online')),
  status text not null default 'novo'
    check (status in ('novo', 'confirmado', 'em_preparo', 'a_caminho', 'entregue', 'cancelado')),
  data_encomenda date,
  observacoes text,
  criado_em timestamptz not null default now()
);
create index if not exists idx_pedidos_cliente on public.pedidos (cliente_id);
create index if not exists idx_pedidos_status on public.pedidos (status);

-- — Itens do pedido (com snapshot imutável) —
create table if not exists public.itens_pedido (
  id uuid primary key default gen_random_uuid(),
  pedido_id uuid not null references public.pedidos (id) on delete cascade,
  produto_id uuid references public.produtos (id) on delete set null,
  nome_snapshot text not null,
  variacoes_snapshot jsonb not null default '[]'::jsonb,
  qtd int not null check (qtd > 0),
  preco_unit numeric(10, 2) not null,
  subtotal numeric(10, 2) not null
);
create index if not exists idx_itens_pedido on public.itens_pedido (pedido_id);

-- — Configurações (linha única) —
create table if not exists public.configuracoes (
  id int primary key default 1 check (id = 1),
  desconto_1a_compra_pct numeric(5, 2) not null default 10,
  whatsapp_bruna text,
  texto_versiculo text,
  referencia_versiculo text,
  atualizado_em timestamptz not null default now()
);

-- — Cria o perfil automaticamente quando um usuário se cadastra —
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.perfis (id, nome)
  values (new.id, new.raw_user_meta_data ->> 'nome')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
