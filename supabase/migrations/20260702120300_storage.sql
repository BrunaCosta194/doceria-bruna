-- ============================================================
-- Storage: bucket público "produtos" (fotos do catálogo)
-- Leitura pública; escrita só para admin.
-- ============================================================

insert into storage.buckets (id, name, public)
values ('produtos', 'produtos', true)
on conflict (id) do nothing;

create policy "produtos foto leitura publica" on storage.objects
  for select using (bucket_id = 'produtos');

create policy "produtos foto admin insere" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'produtos' and public.eh_admin());

create policy "produtos foto admin atualiza" on storage.objects
  for update to authenticated
  using (bucket_id = 'produtos' and public.eh_admin());

create policy "produtos foto admin apaga" on storage.objects
  for delete to authenticated
  using (bucket_id = 'produtos' and public.eh_admin());
