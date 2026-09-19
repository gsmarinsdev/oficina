import { Link, router, useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet } from 'react-native';

import { RecordCard } from '@/components/RecordCard';
import { SplitScreen } from '@/components/SplitScreen';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { listServices } from '@/data/servicesRepository';
import type { Service } from '@/domain/service';
import { useIsMobile } from '@/hooks/use-is-mobile';
import { useTheme } from '@/hooks/use-theme';

type Category = {
  cod_categoria: string;
  categoria: string;
  services: Service[];
};

export default function ServicesListScreen() {
  const theme = useTheme();
  // Celular: tela cheia, 2 colunas. Desktop: só metade da tela, 4 colunas.
  // O `key` na lista força recriar quando o número de colunas muda.
  const numColumns = useIsMobile() ? 2 : 4;
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const loadServices = useCallback(() => {
    setLoading(true);
    listServices()
      .then(setServices)
      .catch((error: Error) => setErrorMessage(error.message))
      .finally(() => setLoading(false));
  }, []);

  useFocusEffect(loadServices);

  const categories = useMemo<Category[]>(() => {
    const byCode = new Map<string, Category>();
    for (const service of services) {
      const existing = byCode.get(service.cod_categoria);
      if (existing) {
        existing.services.push(service);
      } else {
        byCode.set(service.cod_categoria, {
          cod_categoria: service.cod_categoria,
          categoria: service.categoria,
          services: [service],
        });
      }
    }
    return Array.from(byCode.values()).sort((a, b) => a.categoria.localeCompare(b.categoria));
  }, [services]);

  const activeCategory = categories.find((c) => c.cod_categoria === selectedCategory) ?? null;

  const addButtonStyle = StyleSheet.flatten([styles.addButton, { backgroundColor: theme.primary }]);

  return (
    <SplitScreen image={require('@/assets/images/split-servicos.jpg')}>
    <ThemedView style={styles.container}>
      <Link href="/servicos/novo" asChild>
        <Pressable style={addButtonStyle}>
          <ThemedText type="smallBold" style={styles.addButtonLabel}>
            + Novo serviço
          </ThemedText>
        </Pressable>
      </Link>

      {loading && <ActivityIndicator size="large" style={styles.spinner} />}

      {errorMessage && <ThemedText style={styles.errorText}>❌ {errorMessage}</ThemedText>}

      {!loading && !errorMessage && services.length === 0 && (
        <ThemedText themeColor="textSecondary" style={styles.empty}>
          Nenhum serviço cadastrado ainda.
        </ThemedText>
      )}

      {!activeCategory ? (
        <FlatList
          data={categories}
          keyExtractor={(item) => item.cod_categoria}
          key={numColumns}
          numColumns={numColumns}
          columnWrapperStyle={styles.categoryRow}
          renderItem={({ item }) => (
            <Pressable
              style={styles.categoryCardWrapper}
              onPress={() => setSelectedCategory(item.cod_categoria)}>
              <ThemedView type="backgroundElement" style={styles.categoryCard}>
                <ThemedText type="smallBold" style={styles.categoryCardLabel}>
                  {item.categoria}
                </ThemedText>
              </ThemedView>
            </Pressable>
          )}
        />
      ) : (
        <>
          <Pressable style={styles.backButton} onPress={() => setSelectedCategory(null)}>
            <ThemedText themeColor="primary" type="smallBold">
              ← Categorias
            </ThemedText>
          </Pressable>
          <ThemedText type="smallBold" style={styles.categoryTitle}>
            {activeCategory.categoria}
          </ThemedText>

          <FlatList
            data={activeCategory.services}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <RecordCard
                onOpen={() => router.push({ pathname: '/servicos/[id]', params: { id: item.id } })}
                onEdit={() => router.push({ pathname: '/servicos/[id]/editar', params: { id: item.id } })}>
                <ThemedText type="smallBold">{item.nome}</ThemedText>
                <ThemedText themeColor="textSecondary">R$ {item.preco_base.toFixed(2)}</ThemedText>
              </RecordCard>
            )}
          />
        </>
      )}
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
  categoryRow: {
    gap: 12,
  },
  categoryCardWrapper: {
    flex: 1,
  },
  categoryCard: {
    aspectRatio: 1,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryCardLabel: {
    fontSize: 20,
    lineHeight: 26,
    textAlign: 'center',
  },
  backButton: {
    paddingVertical: 4,
  },
  categoryTitle: {
    marginBottom: 4,
  },
  row: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    gap: 4,
  },
});
