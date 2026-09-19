import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet } from 'react-native';
import { Link, router, useFocusEffect } from 'expo-router';

import { listVehicles } from '@/data/vehiclesRepository';
import type { VehicleWithClient } from '@/domain/vehicle';
import { RecordCard } from '@/components/RecordCard';
import { SplitScreen } from '@/components/SplitScreen';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';

export default function VehiclesListScreen() {
  const theme = useTheme();
  const [vehicles, setVehicles] = useState<VehicleWithClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadVehicles = useCallback(() => {
    setLoading(true);
    listVehicles()
      .then(setVehicles)
      .catch((error: Error) => setErrorMessage(error.message))
      .finally(() => setLoading(false));
  }, []);

  useFocusEffect(loadVehicles);

  // O <Link asChild> exige um `style` já achatado no filho direto.
  const addButtonStyle = StyleSheet.flatten([styles.addButton, { backgroundColor: theme.primary }]);

  return (
    <SplitScreen image={require('@/assets/images/elevador.jpg')}>
    <ThemedView style={styles.container}>
      <Link href="/veiculos/novo" asChild>
        <Pressable style={addButtonStyle}>
          <ThemedText type="smallBold" style={styles.addButtonLabel}>
            + Novo veículo
          </ThemedText>
        </Pressable>
      </Link>

      {loading && <ActivityIndicator size="large" style={styles.spinner} />}

      {errorMessage && <ThemedText style={styles.errorText}>❌ {errorMessage}</ThemedText>}

      {!loading && !errorMessage && vehicles.length === 0 && (
        <ThemedText themeColor="textSecondary" style={styles.empty}>
          Nenhum veículo cadastrado ainda.
        </ThemedText>
      )}

      <FlatList
        data={vehicles}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <RecordCard
            onOpen={() => router.push({ pathname: '/veiculos/[id]', params: { id: item.id } })}
            onEdit={() => router.push({ pathname: '/veiculos/[id]/editar', params: { id: item.id } })}>
            <ThemedText type="smallBold">
              {item.placa} — {item.marca} {item.modelo}
            </ThemedText>
            <ThemedText themeColor="textSecondary">{item.clientes?.nome ?? 'Cliente removido'}</ThemedText>
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
});
