-- ============================================================
-- Doceria da Bruna — Row Level Security
-- Princípio: leitura pública do catálogo; cliente só vê os próprios
-- pedidos; escrita sensível só via admin ou service_role (Edge Function).
-- ============================================================

-- Helper: verifica se o usuário atual é admin.
-- SECURITY DEFINER evita recursão de RLS ao ler `perfis`.
create or replace function public.eh_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.perfis
    where id = auth.uid() and papel = 'admin'
  );
$$;

alter table public.categorias enable row level security;
alter table public.produtos enable row level security;
alter table public.variacoes enable row level security;
alter table public.zonas_entrega enable row level security;
alter table public.perfis enable row level security;
alter table public.pedidos enable row level security;
alter table public.itens_pedido enable row level security;
alter table public.configuracoes enable row level security;

-- ── Catálogo: leitura pública dos itens ativos; admin gerencia ──
create policy "categorias leitura publica" on public.categorias
  for select using (ativo = true or public.eh_admin());
create policy "categorias admin escreve" on public.categorias
  for all to authenticated using (public.eh_admin()) with check (public.eh_admin());

create policy "produtos leitura publica" on public.produtos
  for select using (ativo = true or public.eh_admin());
create policy "produtos admin escreve" on public.produtos
  for all to authenticated using (public.eh_admin()) with check (public.eh_admin());

create policy "variacoes leitura publica" on public.variacoes
  for select using (
    public.eh_admin()
    or exists (select 1 from public.produtos p where p.id = produto_id and p.ativo)
  );
create policy "variacoes admin escreve" on public.variacoes
  for all to authenticated using (public.eh_admin()) with check (public.eh_admin());

create policy "zonas leitura publica" on public.zonas_entrega
  for select using (ativo = true or public.eh_admin());
create policy "zonas admin escreve" on public.zonas_entrega
  for all to authenticated using (public.eh_admin()) with check (public.eh_admin());

-- ── Configurações: leitura pública (versículo, % desconto, whatsapp) ──
create policy "config leitura publica" on public.configuracoes
  for select using (true);
create policy "config admin escreve" on public.configuracoes
  for all to authenticated using (public.eh_admin()) with check (public.eh_admin());

-- ── Perfis: cada um vê/edita o seu; admin vê todos ──
create policy "perfis ve o proprio" on public.perfis
  for select using (id = auth.uid() or public.eh_admin());
create policy "perfis edita o proprio" on public.perfis
  for update using (id = auth.uid()) with check (id = auth.uid());

-- Cliente não pode alterar papel nem o flag de desconto (só service_role).
revoke update on public.perfis from authenticated;
grant update (nome, telefone, endereco) on public.perfis to authenticated;

-- ── Pedidos: cliente vê os seus; admin vê e muda status ──
-- Inserção acontece só via Edge Function (service_role ignora RLS).
create policy "pedidos ve os seus" on public.pedidos
  for select using (cliente_id = auth.uid() or public.eh_admin());
create policy "pedidos admin atualiza" on public.pedidos
  for update to authenticated using (public.eh_admin()) with check (public.eh_admin());

-- ── Itens do pedido: visíveis se o pedido é do cliente ou se admin ──
create policy "itens ve os seus" on public.itens_pedido
  for select using (
    public.eh_admin()
    or exists (
      select 1 from public.pedidos pe
      where pe.id = pedido_id and pe.cliente_id = auth.uid()
    )
  );
