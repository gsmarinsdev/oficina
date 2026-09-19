// Formato de um Serviço do catálogo — espelha a tabela `servicos`.
export type Service = {
  id: string;
  nome: string;
  descricao: string | null;
  preco_base: number;
  categoria: string;
  cod_categoria: string;
};

export type ServiceInput = {
  nome: string;
  descricao: string | null;
  preco_base: number;
  categoria: string;
  cod_categoria: string;
};

// Categorias já em uso na tabela `servicos` (conferido direto no banco) —
// fixas, cada uma com seu código de 3 letras. Lista fechada em vez de texto
// livre pra não deixar duplicar categoria com grafia/código diferente.
export const SERVICE_CATEGORIES: { categoria: string; cod_categoria: string }[] = [
  { categoria: 'Manutenção preventiva', cod_categoria: 'MAN' },
  { categoria: 'Motor', cod_categoria: 'MOT' },
  { categoria: 'Freios', cod_categoria: 'FRE' },
  { categoria: 'Suspensão e Direção', cod_categoria: 'SUS' },
  { categoria: 'Transmissão e Embreagem', cod_categoria: 'TRA' },
  { categoria: 'Elétrica', cod_categoria: 'ELE' },
  { categoria: 'Ar-condicionado', cod_categoria: 'ARC' },
  { categoria: 'Diagnóstico e Injeção', cod_categoria: 'DIA' },
  { categoria: 'Pneus e Rodas', cod_categoria: 'PNE' },
  { categoria: 'Estética', cod_categoria: 'EST' },
];
