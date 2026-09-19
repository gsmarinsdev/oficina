-- Data e hora do agendamento da OS (usada no botão "Adicionar ao Google Agenda").
-- Idempotente: pode rodar mais de uma vez.
alter table ordens_servico add column if not exists agendamento timestamptz;
