import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet } from 'react-native';
import { useFocusEffect } from 'expo-router';

import { getOrdersByStatus, getRevenueByPeriod, type StatusBreakdown } from '@/data/reportsRepository';
import type { OrderStatus } from '@/domain/serviceOrder';
import { AppFonts } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { DateInput } from '@/components/DateInput';
import { SplitScreen } from '@/components/SplitScreen';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { showError } from '@/utils/platformAlert';

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

function firstDayOfMonthISO(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function RelatoriosScreen() {
  const theme = useTheme();
  const [startDate, setStartDate] = useState<string | null>(firstDayOfMonthISO());
  const [endDate, setEndDate] = useState<string | null>(todayISO());
  const [revenue, setRevenue] = useState<number | null>(null);
  const [loadingRevenue, setLoadingRevenue] = useState(false);
  const [breakdown, setBreakdown] = useState<StatusBreakdown[]>([]);

  const loadRevenue = useCallback(() => {
    if (!startDate || !endDate) {
      showError('Datas inválidas', 'Preencha o período completo (de/até).');
      return;
    }
    setLoadingRevenue(true);
    getRevenueByPeriod(startDate, endDate)
      .then(setRevenue)
      .catch((error: Error) => showError('Não foi possível calcular o faturamento', error.message))
      .finally(() => setLoadingRevenue(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate]);

  const loadBreakdown = useCallback(() => {
    getOrdersByStatus()
      .then(setBreakdown)
      .catch((error: Error) => showError('Não foi possível carregar as OS por status', error.message));
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadBreakdown();
      loadRevenue();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  );

  const inputStyle = [styles.input, { color: theme.text, borderColor: theme.textSecondary }];
  const totalOrders = breakdown.reduce((sum, item) => sum + item.count, 0);

  return (
    <SplitScreen image={require('@/assets/images/hero-oficina.jpg')}>
      <ScrollView contentContainerStyle={styles.container}>
        <ThemedText type="title" style={styles.title}>
          Relatórios
        </ThemedText>

        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Faturamento por período
        </ThemedText>

        <ThemedView style={styles.periodRow}>
          <ThemedView style={styles.periodField}>
            <ThemedText type="small">De</ThemedText>
            <DateInput
              style={inputStyle}
              value={startDate}
              onChange={setStartDate}
              placeholderTextColor={theme.textSecondary}
            />
          </ThemedView>
          <ThemedView style={styles.periodField}>
            <ThemedText type="small">Até</ThemedText>
            <DateInput
              style={inputStyle}
              value={endDate}
              onChange={setEndDate}
              placeholderTextColor={theme.textSecondary}
            />
          </ThemedView>
        </ThemedView>

        <Pressable
          style={[styles.filterButton, { backgroundColor: theme.primary }]}
          onPress={loadRevenue}
          disabled={loadingRevenue}>
          <ThemedText type="smallBold" style={styles.filterLabel}>
            {loadingRevenue ? 'Calculando...' : 'Filtrar'}
          </ThemedText>
        </Pressable>

        <ThemedView type="backgroundElement" style={styles.revenueCard}>
          <ThemedText themeColor="textSecondary">Total faturado (OS concluídas no período)</ThemedText>
          <ThemedText type="title" style={{ color: theme.primary }}>
            R$ {(revenue ?? 0).toFixed(2)}
          </ThemedText>
        </ThemedView>

        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Ordens de Serviço por status
        </ThemedText>

        {totalOrders === 0 && (
          <ThemedText themeColor="textSecondary" style={styles.empty}>
            Nenhuma OS cadastrada ainda.
          </ThemedText>
        )}

        {breakdown.map((item) => (
          <ThemedView key={item.status} type="backgroundElement" style={styles.statusRow}>
            <ThemedView style={styles.statusInfo}>
              <ThemedText type="smallBold" style={{ color: STATUS_COLOR[item.status] }}>
                {STATUS_LABEL[item.status]}
              </ThemedText>
              <ThemedText themeColor="textSecondary">
                {item.count} {item.count === 1 ? 'ordem' : 'ordens'}
              </ThemedText>
            </ThemedView>
            <ThemedText type="smallBold">R$ {item.total.toFixed(2)}</ThemedText>
          </ThemedView>
        ))}
      </ScrollView>
    </SplitScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 32,
    gap: 8,
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    marginTop: 16,
    marginBottom: 8,
  },
  periodRow: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: 'transparent',
  },
  periodField: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  input: {
    fontFamily: AppFonts.body,
    borderWidth: 1,
    borderRadius: 6,
    padding: 12,
    marginBottom: 8,
  },
  filterButton: {
    borderRadius: 6,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  filterLabel: {
    color: '#FFFFFF',
  },
  revenueCard: {
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    gap: 4,
  },
  empty: {
    textAlign: 'center',
    marginTop: 8,
  },
  statusRow: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusInfo: {
    gap: 2,
    backgroundColor: 'transparent',
  },
});
