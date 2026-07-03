-- ============================================================
-- Doceria da Bruna — Seed inicial (idempotente)
-- ============================================================

-- Configuração única
insert into public.configuracoes
  (id, desconto_1a_compra_pct, whatsapp_bruna, texto_versiculo, referencia_versiculo)
values
  (1, 10, '5599999999999',
   'Provai e vede que o Senhor é bom; bem-aventurado o homem que nele confia.',
   'Salmos 34:8')
on conflict (id) do nothing;

-- Categorias
insert into public.categorias (id, nome, ordem, ativo) values
  ('11111111-1111-1111-1111-111111111101', 'Pães', 1, true),
  ('11111111-1111-1111-1111-111111111102', 'Bolos', 2, true),
  ('11111111-1111-1111-1111-111111111103', 'Doces', 3, true),
  ('11111111-1111-1111-1111-111111111104', 'Caldos', 4, true)
on conflict (id) do nothing;

-- Zonas de entrega
insert into public.zonas_entrega (id, nome_bairro, valor_frete, ativo) values
  ('22222222-2222-2222-2222-222222222201', 'Centro', 6, true),
  ('22222222-2222-2222-2222-222222222202', 'Jardim das Flores', 9, true),
  ('22222222-2222-2222-2222-222222222203', 'Vila Nova', 12, true),
  ('22222222-2222-2222-2222-222222222204', 'Bairro Alto', 15, true)
on conflict (id) do nothing;

-- Produtos
insert into public.produtos
  (id, categoria_id, nome, descricao, preco_base, ativo, sob_encomenda, antecedencia_dias)
values
  ('33333333-3333-3333-3333-333333333301', '11111111-1111-1111-1111-111111111101',
   'Brioche caseiro',
   'Massa fofa e amanteigada, assada no dia.', 18.00, true, false, 0),
  ('33333333-3333-3333-3333-333333333302', '11111111-1111-1111-1111-111111111101',
   'Pão de queijo mineiro',
   'Crocante por fora, macio por dentro, com queijo de verdade.', 16.00, true, false, 0),
  ('33333333-3333-3333-3333-333333333303', '11111111-1111-1111-1111-111111111102',
   'Bolo de cenoura com chocolate',
   'Massa de cenoura úmida com cobertura de brigadeiro.', 45.00, true, true, 2),
  ('33333333-3333-3333-3333-333333333304', '11111111-1111-1111-1111-111111111102',
   'Bolo de aniversário decorado',
   'Feito sob encomenda com o recheio da sua escolha.', 90.00, true, true, 4),
  ('33333333-3333-3333-3333-333333333305', '11111111-1111-1111-1111-111111111103',
   'Caixa de brigadeiros gourmet',
   'Brigadeiros feitos à mão, com chocolate belga. 12 unidades.', 32.00, true, false, 0),
  ('33333333-3333-3333-3333-333333333306', '11111111-1111-1111-1111-111111111104',
   'Caldo verde',
   'Caldo cremoso de batata com couve e calabresa.', 22.00, true, false, 0)
on conflict (id) do nothing;

-- Variações
insert into public.variacoes (id, produto_id, grupo, nome, preco_delta) values
  ('44444444-0000-0000-0000-000000000001', '33333333-3333-3333-3333-333333333301', 'Tamanho', 'Individual', 0),
  ('44444444-0000-0000-0000-000000000002', '33333333-3333-3333-3333-333333333301', 'Tamanho', 'Família', 12),
  ('44444444-0000-0000-0000-000000000003', '33333333-3333-3333-3333-333333333302', 'Porção', '500g', 0),
  ('44444444-0000-0000-0000-000000000004', '33333333-3333-3333-3333-333333333302', 'Porção', '1kg', 14),
  ('44444444-0000-0000-0000-000000000005', '33333333-3333-3333-3333-333333333303', 'Tamanho', 'Pequeno (12 fatias)', 0),
  ('44444444-0000-0000-0000-000000000006', '33333333-3333-3333-3333-333333333303', 'Tamanho', 'Grande (20 fatias)', 30),
  ('44444444-0000-0000-0000-000000000007', '33333333-3333-3333-3333-333333333304', 'Recheio', 'Ninho com morango', 0),
  ('44444444-0000-0000-0000-000000000008', '33333333-3333-3333-3333-333333333304', 'Recheio', 'Brigadeiro gourmet', 10),
  ('44444444-0000-0000-0000-000000000009', '33333333-3333-3333-3333-333333333304', 'Recheio', 'Prestígio', 15),
  ('44444444-0000-0000-0000-000000000010', '33333333-3333-3333-3333-333333333306', 'Tamanho', '500ml', 0),
  ('44444444-0000-0000-0000-000000000011', '33333333-3333-3333-3333-333333333306', 'Tamanho', '1 litro', 16)
on conflict (id) do nothing;
