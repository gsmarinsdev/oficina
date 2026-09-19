-- ============================================================
-- AutoGest — Schema do banco de dados (PostgreSQL / Supabase)
-- Versão consolidada ao final da Fase 1 — reflete o banco real,
-- incluindo o módulo de orçamentos e os ajustes de integridade.
-- ============================================================

-- Clientes
create table clientes (
  id         uuid primary key default gen_random_uuid(),
  nome       text not null,
  telefone   text,
  email      text,
  cpf        text unique,
  endereco   text,
  criado_em  timestamptz default now()
);

-- Veículos (vinculados a um cliente)
create table veiculos (
  id         uuid primary key default gen_random_uuid(),
  cliente_id uuid references clientes(id) on delete cascade,
  placa      text not null unique,
  marca      text not null,
  modelo     text not null,
  ano        int,
  cor        text,
  criado_em  timestamptz default now()
);

-- Catálogo de serviços da oficina
create table servicos (
  id          uuid primary key default gen_random_uuid(),
  nome        text not null,
  descricao   text,
  preco_base  numeric(10,2) not null,
  -- Categoria exibida nos cards da aba Serviços e o código curto dela (ex: MAN)
  categoria     text,
  cod_categoria text
);

-- Orçamento (proposta ao cliente, antes de virar Ordem de Serviço)
create table orcamentos (
  id         uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references clientes(id),
  veiculo_id uuid not null references veiculos(id),
  status     text default 'pendente'
             check (status in ('pendente','aceito','recusado','expirado')),
  validade   date,
  total      numeric(10,2) default 0,
  observacoes text,
  criado_em  timestamptz default now()
);

-- Itens de um orçamento
create table itens_orcamento (
  id            uuid primary key default gen_random_uuid(),
  orcamento_id  uuid not null references orcamentos(id) on delete cascade,
  servico_id    uuid not null references servicos(id),
  quantidade    int default 1,
  preco_unit    numeric(10,2) not null,
  subtotal      numeric(10,2) generated always as (quantidade * preco_unit) stored,
  -- Preenchido só quando preco_unit foge do servicos.preco_base
  -- (ex: "carro muito sujo, retrabalho extra"). O valor do ajuste
  -- não é armazenado: é sempre preco_unit - preco_base, calculado
  -- na hora, para nunca ficar dessincronizado.
  ajuste_motivo text
);

-- Ordem de Serviço
-- orcamento_id é opcional: uma OS pode nascer direto, sem orçamento prévio.
create table ordens_servico (
  id           uuid primary key default gen_random_uuid(),
  veiculo_id   uuid references veiculos(id),
  cliente_id   uuid references clientes(id),
  orcamento_id uuid references orcamentos(id),
  status       text default 'aberta'
               check (status in ('aberta','em_andamento','concluída','cancelada')),
  data_entrada date default current_date,
  data_saida   date,
  -- Data e hora marcadas para a OS (botão "Adicionar ao Google Agenda")
  agendamento  timestamptz,
  total        numeric(10,2) default 0,
  observacoes  text,
  criado_em    timestamptz default now()
);

-- Itens de uma OS
create table itens_os (
  id            uuid primary key default gen_random_uuid(),
  ordem_id      uuid not null references ordens_servico(id) on delete cascade,
  servico_id    uuid not null references servicos(id),
  quantidade    int default 1,
  preco_unit    numeric(10,2) not null,
  subtotal      numeric(10,2) generated always as (quantidade * preco_unit) stored,
  ajuste_motivo text
);

-- Pagamentos
create table pagamentos (
  id       uuid primary key default gen_random_uuid(),
  ordem_id uuid not null references ordens_servico(id),
  valor    numeric(10,2) not null,
  metodo   text check (metodo in ('dinheiro','pix','cartão','outro')),
  pago_em  date default current_date
);

-- ============================================================
-- RLS (Row Level Security)
-- As tabelas nascem SEM RLS. Depois de criar as contas em
-- Authentication, rode supabase/enable_rls.sql: liga o RLS e libera
-- leitura/escrita só para usuários logados. (disable_rls.sql desfaz.)
-- ============================================================
