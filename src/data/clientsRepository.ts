import { supabase } from './supabaseClient';
import type { Client, ClientInput } from '@/domain/client';

// SELECT * FROM clientes ORDER BY nome ASC
export async function listClients(): Promise<Client[]> {
  const { data, error } = await supabase.from('clientes').select('*').order('nome');
  if (error) throw new Error(error.message);
  return data;
}

// SELECT * FROM clientes WHERE id = :id
export async function getClient(id: string): Promise<Client> {
  const { data, error } = await supabase.from('clientes').select('*').eq('id', id).single();
  if (error) throw new Error(error.message);
  return data;
}

// INSERT INTO clientes (...) VALUES (...)
export async function createClient(input: ClientInput): Promise<Client> {
  const { data, error } = await supabase.from('clientes').insert(input).select().single();
  if (error) throw new Error(error.message);
  return data;
}

// UPDATE clientes SET ... WHERE id = :id
export async function updateClient(id: string, input: ClientInput): Promise<Client> {
  const { data, error } = await supabase
    .from('clientes')
    .update(input)
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

// DELETE FROM clientes WHERE id = :id
export async function deleteClient(id: string): Promise<void> {
  const { error } = await supabase.from('clientes').delete().eq('id', id);
  if (error) throw new Error(error.message);
}
