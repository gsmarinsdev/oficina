export type BudgetStatus = 'pendente' | 'aceito' | 'recusado' | 'expirado';

// Formato de um Orçamento — espelha a tabela `orcamentos`.
export type Budget = {
  id: string;
  cliente_id: string;
  veiculo_id: string;
  status: BudgetStatus;
  validade: string | null;
  total: number;
  observacoes: string | null;
  criado_em: string;
};

export type BudgetInput = {
  cliente_id: string;
  veiculo_id: string;
  validade: string | null;
  observacoes: string | null;
};

// Versão usada na listagem: já vem com nome do cliente e dados do veículo.
export type BudgetWithRelations = Budget & {
  clientes: { nome: string } | null;
  veiculos: { placa: string; marca: string; modelo: string } | null;
};

// Item de um orçamento — espelha `itens_orcamento`.
export type BudgetItem = {
  id: string;
  orcamento_id: string;
  servico_id: string;
  quantidade: number;
  preco_unit: number;
  subtotal: number;
  ajuste_motivo: string | null;
};

export type BudgetItemInput = {
  servico_id: string;
  quantidade: number;
  preco_unit: number;
  ajuste_motivo: string | null;
};

// Versão usada na tela de detalhe: já vem com o nome do serviço.
export type BudgetItemWithService = BudgetItem & { servicos: { nome: string } | null };
