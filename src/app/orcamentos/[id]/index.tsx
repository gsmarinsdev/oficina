import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';

import { DetailView, formatDateBR, ItemsList } from '@/components/DetailView';
import { getBudget, listBudgetItems } from '@/data/budgetsRepository';
import { getClient } from '@/data/clientsRepository';
import { getVehicle } from '@/data/vehiclesRepository';
import type { Budget, BudgetItemWithService, BudgetStatus } from '@/domain/budget';

const STATUS_LABEL: Record<BudgetStatus, string> = {
  pendente: 'Pendente',
  aceito: 'Aceito',
  recusado: 'Recusado',
  expirado: 'Expirado',
};

export default function OrcamentoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [budget, setBudget] = useState<Budget | null>(null);
  const [clienteNome, setClienteNome] = useState('');
  const [veiculoLabel, setVeiculoLabel] = useState('');
  const [items, setItems] = useState<BudgetItemWithService[]>([]);

  useFocusEffect(
    useCallback(() => {
      getBudget(id).then((b) => {
        setBudget(b);
        getClient(b.cliente_id).then((c) => setClienteNome(c.nome));
        getVehicle(b.veiculo_id).then((v) => setVeiculoLabel(`${v.placa} — ${v.marca} ${v.modelo}`));
      });
      listBudgetItems(id).then(setItems);
    }, [id])
  );

  if (!budget) {
    return <ActivityIndicator size="large" style={styles.spinner} />;
  }

  return (
    <DetailView
      image={require('@/assets/images/split-orcamentos.jpg')}
      title="Orçamento"
      backHref="/orcamentos"
      fields={[
        { label: 'Cliente', value: clienteNome },
        { label: 'Veículo', value: veiculoLabel },
        { label: 'Status', value: STATUS_LABEL[budget.status] },
        { label: 'Validade', value: formatDateBR(budget.validade) },
        { label: 'Observações', value: budget.observacoes },
      ]}
      onEdit={() => router.push({ pathname: '/orcamentos/[id]/editar', params: { id } })}>
      <ItemsList items={items} total={budget.total} />
    </DetailView>
  );
}

const styles = StyleSheet.create({
  spinner: {
    marginTop: 48,
  },
});
