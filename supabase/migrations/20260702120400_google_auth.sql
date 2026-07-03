-- ============================================================
-- Login com Google: o perfil precisa pegar o nome de onde o
-- provedor mandar. Email/senha usa "nome"; o Google manda
-- "full_name"/"name". Atualiza o trigger com fallback.
-- ============================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.perfis (id, nome)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data ->> 'nome',
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name'
    )
  )
  on conflict (id) do nothing;
  return new;
end;
$$;
