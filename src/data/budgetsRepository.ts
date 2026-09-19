import { supabase } from './supabaseClient';
import type {
  Budget,
  BudgetInput,
  BudgetItem,
  BudgetItemInput,
  BudgetItemWithService,
  BudgetStatus,
  BudgetWithRelations,
} from '@/domain/budget';

export async function listBudgets(): Promise<BudgetWithRelations[]> {
  const { data, error } = await supabase
    .from('orcamentos')
    .select('*, clientes(nome), veiculos(placa, marca, modelo)')
    .order('criado_em', { ascending: false });
  if (error) throw new Error(error.message);
  return data as BudgetWithRelations[];
}

export async function getBudget(id: string): Promise<Budget> {
  const { data, error } = await supabase.from('orcamentos').select('*').eq('id', id).single();
  if (error) throw new Error(error.message);
  return data;
}

// Só orçamentos aceitos podem virar Ordem de Serviço.
export async function listAcceptedBudgets(): Promise<BudgetWithRelations[]> {
  const { data, error } = await supabase
    .from('orcamentos')
    .select('*, clientes(nome), veiculos(placa, marca, modelo)')
    .eq('status', 'aceito')
    .order('criado_em', { ascending: false });
  if (error) throw new Error(error.message);
  return data as BudgetWithRelations[];
}

// Todo orçamento nasce com status 'pendente' e total 0 — os itens são
// adicionados depois, na tela de detalhe.
export async function createBudget(input: BudgetInput): Promise<Budget> {
  const { data, error } = await supabase.from('orcamentos').insert(input).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateBudgetStatus(id: string, status: BudgetStatus): Promise<void> {
  const { error } = await supabase.from('orcamentos').update({ status }).eq('id', id);
  if (error) throw new Error(error.message);
}

export async function updateBudgetDetails(
  id: string,
  input: { validade: string | null; observacoes: string | null }
): Promise<void> {
  const { error } = await supabase.from('orcamentos').update(input).eq('id', id);
  if (error) throw new Error(error.message);
}

export async function deleteBudget(id: string): Promise<void> {
  const { error } = await supabase.from('orcamentos').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

// --- Itens do orçamento ---

export async function listBudgetItems(orcamentoId: string): Promise<BudgetItemWithService[]> {
  const { data, error } = await supabase
    .from('itens_orcamento')
    .select('*, servicos(nome)')
    .eq('orcamento_id', orcamentoId);
  if (error) throw new Error(error.message);
  return data as BudgetItemWithService[];
}

export async function addBudgetItem(orcamentoId: string, input: BudgetItemInput): Promise<BudgetItem> {
  const { data, error } = await supabase
    .from('itens_orcamento')
    .insert({ orcamento_id: orcamentoId, ...input })
    .select()
    .single();
  if (error) throw new Error(error.message);
  await recalcBudgetTotal(orcamentoId);
  return data;
}

export async function deleteBudgetItem(itemId: string, orcamentoId: string): Promise<void> {
  const { error } = await supabase.from('itens_orcamento').delete().eq('id', itemId);
  if (error) throw new Error(error.message);
  await recalcBudgetTotal(orcamentoId);
}

// `orcamentos.total` não é uma coluna calculada pelo banco (ao contrário do
// `subtotal` de cada item) — o app é responsável por manter esse cache
// somado sempre que um item é adicionado ou removido.
async function recalcBudgetTotal(orcamentoId: string): Promise<void> {
  const { data, error } = await supabase
    .from('itens_orcamento')
    .select('subtotal')
    .eq('orcamento_id', orcamentoId);
  if (error) throw new Error(error.message);
  const total = data.reduce((sum, item) => sum + Number(item.subtotal), 0);
  const { error: updateError } = await supabase
    .from('orcamentos')
    .update({ total })
    .eq('id', orcamentoId);
  if (updateError) throw new Error(updateError.message);
}
