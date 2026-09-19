import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet } from 'react-native';
import { Link, router, useFocusEffect } from 'expo-router';

import { listOrders } from '@/data/serviceOrdersRepository';
import type { OrderStatus, ServiceOrderWithRelations } from '@/domain/serviceOrder';
import { RecordCard } from '@/components/RecordCard';
import { SplitScreen } from '@/components/SplitScreen';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';

const STATUS_LABEL: Record<OrderStatus, string> = {
  aberta: 'Aberta',
  em_andamento: 'Em andamento',
  concluída: 'Concluída',
  cancelada: 'Cancelada',
};

const STATUS_COLOR: Record<OrderStatus, string> = {
  aberta: '#E66A1F',
  em_andamento: '#4B5359',
  concluída: '#2E7D32',
  cancelada: '#C0392B',
};

export default function OrdersListScreen() {
  const theme = useTheme();
  const [orders, setOrders] = useState<ServiceOrderWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadOrders = useCallback(() => {
    setLoading(true);
    listOrders()
      .then(setOrders)
      .catch((error: Error) => setErrorMessage(error.message))
      .finally(() => setLoading(false));
  }, []);

  useFocusEffect(loadOrders);

  const addButtonStyle = StyleSheet.flatten([styles.addButton, { backgroundColor: theme.primary }]);

  return (
    <SplitScreen image={require('@/assets/images/garagem.png')}>
      <ThemedView style={styles.container}>
        <Link href="/ordens/novo" asChild>
          <Pressable style={addButtonStyle}>
            <ThemedText type="smallBold" style={styles.addButtonLabel}>
              + Nova OS
            </ThemedText>
          </Pressable>
        </Link>

        {loading && <ActivityIndicator size="large" style={styles.spinner} />}

        {errorMessage && <ThemedText style={styles.errorText}>❌ {errorMessage}</ThemedText>}

        {!loading && !errorMessage && orders.length === 0 && (
          <ThemedText themeColor="textSecondary" style={styles.empty}>
            Nenhuma ordem de serviço aberta ainda.
          </ThemedText>
        )}

        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <RecordCard
              onOpen={() => router.push({ pathname: '/ordens/[id]', params: { id: item.id } })}
              onEdit={() => router.push({ pathname: '/ordens/[id]/editar', params: { id: item.id } })}>
              <ThemedText type="smallBold">{item.clientes?.nome ?? 'Cliente removido'}</ThemedText>
              <ThemedText themeColor="textSecondary">
                {item.veiculos ? `${item.veiculos.placa} — ${item.veiculos.marca} ${item.veiculos.modelo}` : 'Veículo removido'}
              </ThemedText>
              <ThemedView style={styles.rowFooter}>
                <ThemedText type="smallBold" style={{ color: STATUS_COLOR[item.status] }}>
                  {STATUS_LABEL[item.status]}
                </ThemedText>
                <ThemedText type="smallBold">R$ {item.total.toFixed(2)}</ThemedText>
              </ThemedView>
            </RecordCard>
          )}
        />
      </ThemedView>
    </SplitScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    gap: 12,
  },
  addButton: {
    borderRadius: 6,
    paddingVertical: 12,
    alignItems: 'center',
  },
  addButtonLabel: {
    color: '#FFFFFF',
  },
  spinner: {
    marginTop: 24,
  },
  errorText: {
    color: '#C0392B',
  },
  empty: {
    textAlign: 'center',
    marginTop: 24,
  },
  row: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    gap: 4,
  },
  rowFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    backgroundColor: 'transparent',
  },
});
