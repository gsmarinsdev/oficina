-- Liga o RLS nas 8 tabelas e libera tudo apenas para usuários autenticados
-- (quem tem sessão no Supabase Auth). Sem login, a anon key não lê nem grava.
-- Idempotente: pode rodar quantas vezes quiser. Para desfazer: disable_rls.sql.
do $$
declare t text;
begin
  foreach t in array array[
    'clientes','veiculos','servicos','orcamentos',
    'itens_orcamento','ordens_servico','itens_os','pagamentos'
  ] loop
    execute format('alter table %I enable row level security', t);
    execute format('drop policy if exists "somente autenticados" on %I', t);
    execute format(
      'create policy "somente autenticados" on %I
         for all to authenticated using (true) with check (true)', t);
  end loop;
end $$;
