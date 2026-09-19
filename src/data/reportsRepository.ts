import { supabase } from './supabaseClient';
import type { OrderStatus } from '@/domain/serviceOrder';

export type StatusBreakdown = { status: OrderStatus; count: number; total: number };

// Faturamento = soma do total das OS concluídas cuja data de saída caiu
// dentro do período (é a data que representa "quando o serviço foi entregue").
export async function getRevenueByPeriod(startDate: string, endDate: string): Promise<number> {
  const { data, error } = await supabase
    .from('ordens_servico')
    .select('total')
    .eq('status', 'concluída')
    .gte('data_saida', startDate)
    .lte('data_saida', endDate);
  if (error) throw new Error(error.message);
  return data.reduce((sum, order) => sum + Number(order.total), 0);
}

const ALL_STATUSES: OrderStatus[] = ['aberta', 'em_andamento', 'concluída', 'cancelada'];

export async function getOrdersByStatus(): Promise<StatusBreakdown[]> {
  const { data, error } = await supabase.from('ordens_servico').select('status, total');
  if (error) throw new Error(error.message);
  return ALL_STATUSES.map((status) => {
    const rows = data.filter((order) => order.status === status);
    return { status, count: rows.length, total: rows.reduce((sum, order) => sum + Number(order.total), 0) };
  });
}
