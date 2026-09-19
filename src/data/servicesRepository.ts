import { supabase } from './supabaseClient';
import type { Service, ServiceInput } from '@/domain/service';

export async function listServices(): Promise<Service[]> {
  const { data, error } = await supabase.from('servicos').select('*').order('nome');
  if (error) throw new Error(error.message);
  return data;
}

export async function getService(id: string): Promise<Service> {
  const { data, error } = await supabase.from('servicos').select('*').eq('id', id).single();
  if (error) throw new Error(error.message);
  return data;
}

export async function createService(input: ServiceInput): Promise<Service> {
  const { data, error } = await supabase.from('servicos').insert(input).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateService(id: string, input: ServiceInput): Promise<Service> {
  const { data, error } = await supabase
    .from('servicos')
    .update(input)
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteService(id: string): Promise<void> {
  const { error } = await supabase.from('servicos').delete().eq('id', id);
  if (error) throw new Error(error.message);
}
