-- ============================================================
-- Confirmação de encomenda: novo status "aguardando_confirmacao".
-- Pedidos com item sob encomenda nascem aguardando a Bruna
-- confirmar; pronta entrega continua nascendo como "novo".
-- ============================================================

alter table public.pedidos
  drop constraint if exists pedidos_status_check;

alter table public.pedidos
  add constraint pedidos_status_check
  check (status in (
    'aguardando_confirmacao',
    'novo',
    'confirmado',
    'em_preparo',
    'a_caminho',
    'entregue',
    'cancelado'
  ));
