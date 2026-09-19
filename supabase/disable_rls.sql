-- Garante que RLS está desligado nas 8 tabelas (sem autenticação ainda, a
-- anon key precisa de acesso total pelo app). Idempotente: pode rodar
-- quantas vezes quiser.
alter table clientes disable row level security;
alter table veiculos disable row level security;
alter table servicos disable row level security;
alter table orcamentos disable row level security;
alter table itens_orcamento disable row level security;
alter table ordens_servico disable row level security;
alter table itens_os disable row level security;
alter table pagamentos disable row level security;
