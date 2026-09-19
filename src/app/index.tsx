import { Image } from 'expo-image';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { PeriodFilter } from '@/components/PeriodFilter';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { getDashboardCounts, type DashboardCounts } from '@/data/dashboardRepository';
import { useTheme } from '@/hooks/use-theme';
import { describeRange, rangeFor, type Period } from '@/utils/period';

export default function HomeScreen() {
  const theme = useTheme();
  const [counts, setCounts] = useState<DashboardCounts | null>(null);
  const [period, setPeriod] = useState<Period>({ key: 'tudo', range: rangeFor('tudo') });
  const { from, to } = period.range;

  // Recarrega ao ganhar foco e sempre que o período muda.
  useFocusEffect(
    useCallback(() => {
      getDashboardCounts({ from, to }).then(setCounts);
    }, [from, to])
  );

  return (
    <ThemedView style={styles.outer}>
      <ScrollView>
        {/* Hero */}
        <View style={styles.hero}>
          <Image
            source={require('@/assets/images/Imagem_ferramentas_1.jpg')}
            style={styles.heroImage}
            contentFit="cover"
          />
          <View style={styles.heroOverlay} />
          <View style={styles.heroContent}>
            <ThemedText type="smallBold" style={[styles.eyebrow, { color: theme.primary }]}>
              SISTEMA DE GESTÃO
            </ThemedText>
            <ThemedText type="title" style={styles.headline}>
              Cuide da sua oficina{'\n'}com{' '}
              <ThemedText type="title" style={{ color: theme.primary }}>
                controle total
              </ThemedText>
            </ThemedText>
            <ThemedText style={styles.subtitle}>
              Clientes, veículos, orçamentos e ordens de serviço em um só lugar.
            </ThemedText>

            <View style={styles.ctaRow}>
              <Pressable
                style={[styles.ctaPrimary, { backgroundColor: theme.primary }]}
                onPress={() => router.push('/ordens/novo')}>
                <ThemedText type="smallBold" style={styles.ctaPrimaryLabel}>
                  + Nova OS
                </ThemedText>
              </Pressable>
              <Pressable style={styles.ctaSecondary} onPress={() => router.push('/clientes')}>
                <ThemedText type="smallBold" style={styles.ctaSecondaryLabel}>
                  Ver Clientes
                </ThemedText>
              </Pressable>
            </View>
          </View>
        </View>

        {/* Estatísticas — números reais do banco, não decoração */}
        <View style={styles.filterWrap}>
          <PeriodFilter value={period} onChange={setPeriod} />
          <ThemedText themeColor="textSecondary" type="small" style={styles.periodCaption}>
            Orçamentos, OS e faturamento: {describeRange(period.range)}
          </ThemedText>
        </View>
        <View style={styles.statsRow}>
          <StatTile label="Clientes (total)" value={counts?.clientes} />
          <StatTile label="Veículos (total)" value={counts?.veiculos} />
          <StatTile label="Orçamentos" value={counts?.orcamentos} />
          <StatTile label="Ordens de Serviço" value={counts?.ordens} />
          <StatTile
            label="Faturamento (OS concluídas)"
            value={
              counts
                ? `R$ ${counts.faturamento.toLocaleString('pt-BR', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}`
                : undefined
            }
          />
        </View>
      </ScrollView>
    </ThemedView>
  );
}

function StatTile({ label, value }: { label: string; value: number | string | undefined }) {
  const theme = useTheme();
  return (
    <ThemedView type="backgroundElement" style={styles.statTile}>
      <ThemedText type="title" style={[styles.statValue, { color: theme.primary }]}>
        {value ?? '—'}
      </ThemedText>
      <ThemedText themeColor="textSecondary" style={styles.statLabel}>
        {label}
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  outer: {
    flex: 1,
  },
  hero: {
    height: 360,
    justifyContent: 'center',
  },
  heroImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  heroOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(20, 22, 24, 0.72)',
  },
  heroContent: {
    padding: 24,
    gap: 12,
  },
  eyebrow: {
    letterSpacing: 1.5,
  },
  headline: {
    color: '#FFFFFF',
    fontSize: 34,
    lineHeight: 40,
  },
  subtitle: {
    color: '#E7E9EA',
    maxWidth: 420,
  },
  ctaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 8,
  },
  ctaPrimary: {
    borderRadius: 6,
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  ctaPrimaryLabel: {
    color: '#FFFFFF',
  },
  ctaSecondary: {
    borderRadius: 6,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  ctaSecondaryLabel: {
    color: '#FFFFFF',
  },
  filterWrap: {
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 8,
  },
  periodCaption: {
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    padding: 20,
  },
  statTile: {
    flexGrow: 1,
    flexBasis: 140,
    borderRadius: 10,
    padding: 18,
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 32,
    lineHeight: 36,
  },
  statLabel: {
    textAlign: 'center',
  },
});
