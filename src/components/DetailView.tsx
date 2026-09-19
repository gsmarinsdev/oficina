import { Ionicons } from '@expo/vector-icons';
import type { ImageSource } from 'expo-image';
import type { Href } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet } from 'react-native';

import { useTheme } from '@/hooks/use-theme';
import { BackToListButton } from './BackToListButton';
import { SplitScreen } from './SplitScreen';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

export type DetailField = { label: string; value: string | null | undefined };

type Props = {
  image: ImageSource;
  title: string;
  fields: DetailField[];
  backHref: Href;
  onEdit: () => void;
  children?: ReactNode;
};

export function formatDateBR(iso: string | null | undefined): string | null {
  return iso ? iso.split('-').reverse().join('/') : null;
}

// Tela só de leitura de um registro: todos os campos + botão para editar.
export function DetailView({ image, title, fields, backHref, onEdit, children }: Props) {
  const theme = useTheme();

  return (
    <SplitScreen image={image}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <ThemedView style={styles.container}>
          <BackToListButton href={backHref} flush />
          <ThemedText type="title" style={styles.title}>
            {title}
          </ThemedText>

          {fields.map((field) => (
            <ThemedView key={field.label} style={styles.field}>
              <ThemedText type="smallBold" themeColor="textSecondary">
                {field.label}
              </ThemedText>
              <ThemedText>{field.value || '—'}</ThemedText>
            </ThemedView>
          ))}

          {children}

          <Pressable style={[styles.editButton, { backgroundColor: theme.primary }]} onPress={onEdit}>
            <Ionicons name="pencil" size={16} color="#FFFFFF" />
            <ThemedText type="smallBold" style={styles.editLabel}>
              Editar
            </ThemedText>
          </Pressable>
        </ThemedView>
      </ScrollView>
    </SplitScreen>
  );
}

type ItemRow = {
  id: string;
  quantidade: number;
  preco_unit: number;
  subtotal: number;
  ajuste_motivo: string | null;
  servicos: { nome: string } | null;
};

export function ItemsList({
  items,
  total,
  title = 'Itens',
}: {
  items: ItemRow[];
  total: number;
  title?: string;
}) {
  return (
    <ThemedView style={styles.items}>
      <ThemedText type="subtitle" style={styles.itemsTitle}>
        {title}
      </ThemedText>

      {items.length === 0 && (
        <ThemedText themeColor="textSecondary">Nenhum serviço adicionado.</ThemedText>
      )}

      {items.map((item) => (
        <ThemedView key={item.id} type="backgroundElement" style={styles.itemRow}>
          <ThemedText type="smallBold">{item.servicos?.nome ?? 'Serviço removido'}</ThemedText>
          <ThemedText themeColor="textSecondary">
            {item.quantidade} x R$ {item.preco_unit.toFixed(2)} = R$ {item.subtotal.toFixed(2)}
          </ThemedText>
          {item.ajuste_motivo && (
            <ThemedText themeColor="textSecondary" style={styles.italic}>
              {item.ajuste_motivo}
            </ThemedText>
          )}
        </ThemedView>
      ))}

      <ThemedText type="subtitle" style={styles.total}>
        Total: R$ {total.toFixed(2)}
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  container: {
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
    padding: 16,
    paddingBottom: 32,
    gap: 12,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
  },
  field: {
    gap: 2,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 6,
    paddingVertical: 14,
    marginTop: 8,
  },
  editLabel: {
    color: '#FFFFFF',
  },
  items: {
    gap: 8,
    marginTop: 8,
  },
  itemsTitle: {
    marginBottom: 4,
  },
  itemRow: {
    borderRadius: 8,
    padding: 16,
    gap: 2,
  },
  italic: {
    fontStyle: 'italic',
  },
  total: {
    marginTop: 8,
    textAlign: 'right',
  },
});
