import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { useTheme } from '@/hooks/use-theme';
import { ThemedView } from './themed-view';

type Props = {
  children: ReactNode;
  onOpen: () => void;
  onEdit: () => void;
};

// Card das listas: tocar no corpo abre a visualização; o lápis abre a edição.
// Os dois são irmãos (não aninhados) para o clique do lápis nunca abrir o card.
export function RecordCard({ children, onOpen, onEdit }: Props) {
  const theme = useTheme();

  return (
    <ThemedView type="backgroundElement" style={styles.card}>
      <Pressable style={styles.body} onPress={onOpen}>
        {children}
      </Pressable>
      <Pressable
        style={styles.editButton}
        onPress={onEdit}
        accessibilityRole="button"
        accessibilityLabel="Editar">
        <Ionicons name="pencil" size={20} color={theme.primary} />
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'stretch',
    borderRadius: 8,
    marginBottom: 8,
  },
  body: {
    flex: 1,
    padding: 16,
    gap: 4,
  },
  editButton: {
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
});
