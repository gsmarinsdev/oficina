import { supabase } from './supabaseClient';
import type {
  OrderItem,
  OrderItemInput,
  OrderItemWithService,
  OrderStatus,
  ServiceOrder,
  ServiceOrderInput,
  ServiceOrderWithRelations,
} from '@/domain/serviceOrder';

export async function listOrders(): Promise<ServiceOrderWithRelations[]> {
  const { data, error } = await supabase
    .from('ordens_servico')
    .select('*, clientes(nome), veiculos(placa, marca, modelo)')
    .order('criado_em', { ascending: false });
  if (error) throw new Error(error.message);
  return data as ServiceOrderWithRelations[];
}

export async function getOrder(id: string): Promise<ServiceOrder> {
  const { data, error } = await supabase.from('ordens_servico').select('*').eq('id', id).single();
  if (error) throw new Error(error.message);
  return data;
}

// Toda OS nasce com status 'aberta', total 0 e data_entrada = hoje (default do banco).
export async function createOrder(input: ServiceOrderInput): Promise<ServiceOrder> {
  const { data, error } = await supabase.from('ordens_servico').insert(input).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateOrder(
  id: string,
  input: {
    status?: OrderStatus;
    data_saida?: string | null;
    observacoes?: string | null;
    agendamento?: string | null;
  }
): Promise<void> {
  const { error } = await supabase.from('ordens_servico').update(input).eq('id', id);
  if (error) throw new Error(error.message);
}

export async function deleteOrder(id: string): Promise<void> {
  const { error } = await supabase.from('ordens_servico').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

// --- Itens da OS ---

export async function listOrderItems(ordemId: string): Promise<OrderItemWithService[]> {
  const { data, error } = await supabase
    .from('itens_os')
    .select('*, servicos(nome)')
    .eq('ordem_id', ordemId);
  if (error) throw new Error(error.message);
  return data as OrderItemWithService[];
}

export async function addOrderItem(ordemId: string, input: OrderItemInput): Promise<OrderItem> {
  const { data, error } = await supabase
    .from('itens_os')
    .insert({ ordem_id: ordemId, ...input })
    .select()
    .single();
  if (error) throw new Error(error.message);
  await recalcOrderTotal(ordemId);
  return data;
}

export async function deleteOrderItem(itemId: string, ordemId: string): Promise<void> {
  const { error } = await supabase.from('itens_os').delete().eq('id', itemId);
  if (error) throw new Error(error.message);
  await recalcOrderTotal(ordemId);
}

// `ordens_servico.total` não é gerado pelo banco — mesma lógica do total do orçamento.
async function recalcOrderTotal(ordemId: string): Promise<void> {
  const { data, error } = await supabase.from('itens_os').select('subtotal').eq('ordem_id', ordemId);
  if (error) throw new Error(error.message);
  const total = data.reduce((sum, item) => sum + Number(item.subtotal), 0);
  const { error: updateError } = await supabase
    .from('ordens_servico')
    .update({ total })
    .eq('id', ordemId);
  if (updateError) throw new Error(updateError.message);
}
