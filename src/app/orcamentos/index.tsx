import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, TextInput } from 'react-native';
import { Link, router, useFocusEffect } from 'expo-router';

import { listBudgets } from '@/data/budgetsRepository';
import type { BudgetStatus, BudgetWithRelations } from '@/domain/budget';
import { AppFonts } from '@/constants/theme';
import { RecordCard } from '@/components/RecordCard';
import { SplitScreen } from '@/components/SplitScreen';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';

const STATUS_LABEL: Record<BudgetStatus, string> = {
  pendente: 'Pendente',
  aceito: 'Aceito',
  recusado: 'Recusado',
  expirado: 'Expirado',
};

const STATUS_COLOR: Record<BudgetStatus, string> = {
  pendente: '#E66A1F',
  aceito: '#2E7D32',
  recusado: '#C0392B',
  expirado: '#4B5359',
};

export default function BudgetsListScreen() {
  const theme = useTheme();
  const [budgets, setBudgets] = useState<BudgetWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [showAll, setShowAll] = useState(false);

  const loadBudgets = useCallback(() => {
    setLoading(true);
    listBudgets()
      .then(setBudgets)
      .catch((error: Error) => setErrorMessage(error.message))
      .finally(() => setLoading(false));
  }, []);

  // Carrega em segundo plano — a lista só aparece quando o usuário busca
  // ou pede pra ver todos, mas os dados já ficam prontos pra isso.
  useFocusEffect(loadBudgets);

  const searching = search.trim().length > 0;
  const visibleBudgets = useMemo(() => {
    if (!searching) return budgets;
    const term = search.trim().toLowerCase();
    return budgets.filter((item) => item.clientes?.nome.toLowerCase().includes(term));
  }, [budgets, search, searching]);

  const addButtonStyle = StyleSheet.flatten([styles.addButton, { backgroundColor: theme.primary }]);

  return (
    <SplitScreen image={require('@/assets/images/split-orcamentos.jpg')}>
    <ThemedView style={styles.container}>
      <Link href="/orcamentos/novo" asChild>
        <Pressable style={addButtonStyle}>
          <ThemedText type="smallBold" style={styles.addButtonLabel}>
            + Novo orçamento
          </ThemedText>
        </Pressable>
      </Link>

      <TextInput
        style={[styles.searchInput, { color: theme.text, borderColor: theme.textSecondary }]}
        value={search}
        onChangeText={setSearch}
        placeholder="Buscar orçamento pelo nome do cliente..."
        placeholderTextColor={theme.textSecondary}
      />

      <Pressable style={styles.listAllButton} onPress={() => setShowAll(true)}>
        <ThemedText themeColor="primary" type="smallBold">
          Listar todos
        </ThemedText>
      </Pressable>

      {loading && <ActivityIndicator size="large" style={styles.spinner} />}

      {errorMessage && <ThemedText style={styles.errorText}>❌ {errorMessage}</ThemedText>}

      {!loading && !errorMessage && !searching && !showAll && (
        <ThemedText themeColor="textSecondary" style={styles.empty}>
          Digite o nome de um cliente pra buscar, ou toque em "Listar todos".
        </ThemedText>
      )}

      {!loading && !errorMessage && (searching || showAll) && visibleBudgets.length === 0 && (
        <ThemedText themeColor="textSecondary" style={styles.empty}>
          {searching ? 'Nenhum orçamento encontrado para esse cliente.' : 'Nenhum orçamento cadastrado ainda.'}
        </ThemedText>
      )}

      <FlatList
        data={searching || showAll ? visibleBudgets : []}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <RecordCard
            onOpen={() => router.push({ pathname: '/orcamentos/[id]', params: { id: item.id } })}
            onEdit={() => router.push({ pathname: '/orcamentos/[id]/editar', params: { id: item.id } })}>
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
  searchInput: {
    fontFamily: AppFonts.body,
    borderWidth: 1,
    borderRadius: 6,
    padding: 12,
  },
  listAllButton: {
    alignSelf: 'flex-start',
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
