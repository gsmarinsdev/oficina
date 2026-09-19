import { supabase } from './supabaseClient';
import type { Vehicle, VehicleInput, VehicleWithClient } from '@/domain/vehicle';

// SELECT veiculos.*, clientes.nome FROM veiculos JOIN clientes ... ORDER BY placa
// (o Supabase detecta a FK cliente_id -> clientes e faz o join sozinho)
export async function listVehicles(): Promise<VehicleWithClient[]> {
  const { data, error } = await supabase
    .from('veiculos')
    .select('*, clientes(nome)')
    .order('placa');
  if (error) throw new Error(error.message);
  return data as VehicleWithClient[];
}

// Veículos de um cliente específico — usado no seletor de veículo do Orçamento.
export async function listVehiclesByClient(clienteId: string): Promise<Vehicle[]> {
  const { data, error } = await supabase
    .from('veiculos')
    .select('*')
    .eq('cliente_id', clienteId)
    .order('placa');
  if (error) throw new Error(error.message);
  return data;
}

export async function getVehicle(id: string): Promise<Vehicle> {
  const { data, error } = await supabase.from('veiculos').select('*').eq('id', id).single();
  if (error) throw new Error(error.message);
  return data;
}

export async function createVehicle(input: VehicleInput): Promise<Vehicle> {
  const { data, error } = await supabase.from('veiculos').insert(input).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateVehicle(id: string, input: VehicleInput): Promise<Vehicle> {
  const { data, error } = await supabase
    .from('veiculos')
    .update(input)
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteVehicle(id: string): Promise<void> {
  const { error } = await supabase.from('veiculos').delete().eq('id', id);
  if (error) throw new Error(error.message);
}
