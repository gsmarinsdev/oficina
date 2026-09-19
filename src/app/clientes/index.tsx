import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet } from 'react-native';
import { Link, router, useFocusEffect } from 'expo-router';

import { listClients } from '@/data/clientsRepository';
import type { Client } from '@/domain/client';
import { RecordCard } from '@/components/RecordCard';
import { SplitScreen } from '@/components/SplitScreen';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';

export default function ClientsListScreen() {
  const theme = useTheme();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadClients = useCallback(() => {
    setLoading(true);
    listClients()
      .then(setClients)
      .catch((error: Error) => setErrorMessage(error.message))
      .finally(() => setLoading(false));
  }, []);

  // Roda toda vez que a tela ganha foco (ex: ao voltar do cadastro).
  useFocusEffect(loadClients);

  // O <Link asChild> clona o filho direto e precisa de um `style` já
  // "achatado" (um objeto só) — um array de estilos nesse ponto quebra
  // o componente. Combinamos com StyleSheet.flatten antes de passar.
  const addButtonStyle = StyleSheet.flatten([styles.addButton, { backgroundColor: theme.primary }]);

  return (
    <SplitScreen image={require('@/assets/images/split-clientes.jpg')}>
    <ThemedView style={styles.container}>
      <ThemedText type="title">Clientes</ThemedText>
      <Link href="/clientes/novo" asChild>
        <Pressable style={addButtonStyle}>
          <ThemedText type="smallBold" style={styles.addButtonLabel}>
            + Novo cliente
          </ThemedText>
        </Pressable>
      </Link>

      {loading && <ActivityIndicator size="large" style={styles.spinner} />}

      {errorMessage && <ThemedText style={styles.errorText}>❌ {errorMessage}</ThemedText>}

      {!loading && !errorMessage && clients.length === 0 && (
        <ThemedText themeColor="textSecondary" style={styles.empty}>
          Nenhum cliente cadastrado ainda.
        </ThemedText>
      )}

      <FlatList
        data={clients}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <RecordCard
            onOpen={() => router.push({ pathname: '/clientes/[id]', params: { id: item.id } })}
            onEdit={() => router.push({ pathname: '/clientes/[id]/editar', params: { id: item.id } })}>
            <ThemedText type="smallBold">{item.nome}</ThemedText>
            {item.telefone && <ThemedText themeColor="textSecondary">{item.telefone}</ThemedText>}
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
  errorText: {
    color: '#C0392B',
  },
  spinner: {
    marginTop: 24,
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
  title: {
  marginBottom: 8,
},
});
