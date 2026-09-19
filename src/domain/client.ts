// Formato de um Cliente dentro do app — espelha a tabela `clientes` do Supabase.
export type Client = {
  id: string;
  nome: string;
  telefone: string | null;
  email: string | null;
  cpf: string | null;
  endereco: string | null;
  criado_em: string;
};

// Dados que o formulário envia ao criar/editar (sem id/criado_em, que o banco gera sozinho).
export type ClientInput = {
  nome: string;
  telefone: string | null;
  email: string | null;
  cpf: string | null;
  endereco: string | null;
};
