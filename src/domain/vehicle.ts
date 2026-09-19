// Formato de um Veículo dentro do app — espelha a tabela `veiculos` do Supabase.
export type Vehicle = {
  id: string;
  cliente_id: string;
  placa: string;
  marca: string;
  modelo: string;
  ano: number | null;
  cor: string | null;
  criado_em: string;
};

export type VehicleInput = {
  cliente_id: string;
  placa: string;
  marca: string;
  modelo: string;
  ano: number | null;
  cor: string | null;
};

// Versão usada na listagem: já vem com o nome do cliente embutido
// (join feito pelo próprio Supabase via `select('*, clientes(nome)')`).
export type VehicleWithClient = Vehicle & { clientes: { nome: string } | null };
