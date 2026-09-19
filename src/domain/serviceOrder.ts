export type OrderStatus = 'aberta' | 'em_andamento' | 'concluída' | 'cancelada';

// Formato de uma Ordem de Serviço — espelha a tabela `ordens_servico`.
export type ServiceOrder = {
  id: string;
  cliente_id: string;
  veiculo_id: string;
  orcamento_id: string | null;
  status: OrderStatus;
  data_entrada: string;
  data_saida: string | null;
  agendamento: string | null;
  total: number;
  observacoes: string | null;
  criado_em: string;
};

export type ServiceOrderInput = {
  cliente_id: string;
  veiculo_id: string;
  orcamento_id: string | null;
  observacoes: string | null;
};

// Versão usada na listagem: já vem com nome do cliente e dados do veículo.
export type ServiceOrderWithRelations = ServiceOrder & {
  clientes: { nome: string } | null;
  veiculos: { placa: string; marca: string; modelo: string } | null;
};

// Item de uma OS — espelha `itens_os`.
export type OrderItem = {
  id: string;
  ordem_id: string;
  servico_id: string;
  quantidade: number;
  preco_unit: number;
  subtotal: number;
  ajuste_motivo: string | null;
};

export type OrderItemInput = {
  servico_id: string;
  quantidade: number;
  preco_unit: number;
  ajuste_motivo: string | null;
};

export type OrderItemWithService = OrderItem & { servicos: { nome: string } | null };
