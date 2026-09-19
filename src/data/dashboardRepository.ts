import type { DateRange } from '@/utils/period';
import { supabase } from './supabaseClient';

export type DashboardCounts = {
  clientes: number;
  veiculos: number;
  orcamentos: number;
  ordens: number;
  faturamento: number;
};

// count: 'exact', head: true -> só pede a contagem, sem trazer as linhas
// (mesmo truque usado no teste de conexão da Fase 2).
async function countRows(table: string): Promise<number> {
  const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true });
  if (error) throw new Error(error.message);
  return count ?? 0;
}

// `criado_em` é timestamptz: o dia inteiro é do fuso local, então converte
// 00:00 e 23:59:59.999 locais para UTC antes de comparar.
async function countBudgets({ from, to }: DateRange): Promise<number> {
  let query = supabase.from('orcamentos').select('*', { count: 'exact', head: true });
  if (from) query = query.gte('criado_em', new Date(`${from}T00:00:00`).toISOString());
  if (to) query = query.lte('criado_em', new Date(`${to}T23:59:59.999`).toISOString());
  const { count, error } = await query;
  if (error) throw new Error(error.message);
  return count ?? 0;
}

// OS entram no período pela data de entrada na oficina.
async function countOrders({ from, to }: DateRange): Promise<number> {
  let query = supabase.from('ordens_servico').select('*', { count: 'exact', head: true });
  if (from) query = query.gte('data_entrada', from);
  if (to) query = query.lte('data_entrada', to);
  const { count, error } = await query;
  if (error) throw new Error(error.message);
  return count ?? 0;
}

// Faturamento = soma das OS concluídas cuja data de saída cai no período.
async function sumRevenue({ from, to }: DateRange): Promise<number> {
  let query = supabase.from('ordens_servico').select('total').eq('status', 'concluída');
  if (from) query = query.gte('data_saida', from);
  if (to) query = query.lte('data_saida', to);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []).reduce((sum, row) => sum + Number(row.total ?? 0), 0);
}

export async function getDashboardCounts(range: DateRange): Promise<DashboardCounts> {
  const [clientes, veiculos, orcamentos, ordens, faturamento] = await Promise.all([
    countRows('clientes'),
    countRows('veiculos'),
    countBudgets(range),
    countOrders(range),
    sumRevenue(range),
  ]);
  return { clientes, veiculos, orcamentos, ordens, faturamento };
}
