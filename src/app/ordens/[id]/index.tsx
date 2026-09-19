import { Link, router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet } from 'react-native';

import { CalendarButton } from '@/components/CalendarButton';
import { DetailView, formatDateBR, ItemsList } from '@/components/DetailView';
import { PrintOrderButton } from '@/components/PrintOrderButton';
import { ThemedText } from '@/components/themed-text';
import { getClient } from '@/data/clientsRepository';
import { getOrder, listOrderItems } from '@/data/serviceOrdersRepository';
import { getVehicle } from '@/data/vehiclesRepository';
import type { OrderItemWithService, OrderStatus, ServiceOrder } from '@/domain/serviceOrder';
import { formatAgendamento } from '@/utils/calendar';

const STATUS_LABEL: Record<OrderStatus, string> = {
  aberta: 'Aberta',
  em_andamento: 'Em andamento',
  concluída: 'Concluída',
  cancelada: 'Cancelada',
};

export default function OrdemScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [order, setOrder] = useState<ServiceOrder | null>(null);
  const [clienteNome, setClienteNome] = useState('');
  const [veiculoLabel, setVeiculoLabel] = useState('');
  const [items, setItems] = useState<OrderItemWithService[]>([]);

  useFocusEffect(
    useCallback(() => {
      getOrder(id).then((o) => {
        setOrder(o);
        getClient(o.cliente_id).then((c) => setClienteNome(c.nome));
        getVehicle(o.veiculo_id).then((v) => setVeiculoLabel(`${v.placa} — ${v.marca} ${v.modelo}`));
      });
      listOrderItems(id).then(setItems);
    }, [id])
  );

  if (!order) {
    return <ActivityIndicator size="large" style={styles.spinner} />;
  }

  return (
    <DetailView
      image={require('@/assets/images/garagem.png')}
      title="Ordem de Serviço"
      backHref="/ordens"
      fields={[
        { label: 'Cliente', value: clienteNome },
        { label: 'Veículo', value: veiculoLabel },
        { label: 'Status', value: STATUS_LABEL[order.status] },
        { label: 'Data de entrada', value: formatDateBR(order.data_entrada) },
        { label: 'Data de saída', value: formatDateBR(order.data_saida) },
        { label: 'Agendamento', value: formatAgendamento(order.agendamento) },
        { label: 'Observações', value: order.observacoes },
      ]}
      onEdit={() => router.push({ pathname: '/ordens/[id]/editar', params: { id } })}>
      {order.orcamento_id && (
        <Link href={{ pathname: '/orcamentos/[id]', params: { id: order.orcamento_id } }} asChild>
          <Pressable>
            <ThemedText themeColor="primary" type="small">
              Originada do orçamento →
            </ThemedText>
          </Pressable>
        </Link>
      )}
      <ItemsList items={items} total={order.total} title="Serviços" />
      <PrintOrderButton orderId={id} />
      <CalendarButton orderId={id} />
    </DetailView>
  );
}

const styles = StyleSheet.create({
  spinner: {
    marginTop: 48,
  },
});
