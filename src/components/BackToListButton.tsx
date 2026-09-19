import { Ionicons } from '@expo/vector-icons';
import { router, type Href } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';

import { useTheme } from '@/hooks/use-theme';
import { ThemedText } from './themed-text';

type Props = {
  href: Href;
  // Dentro de um container que já tem padding e largura máxima (visualização, OS, orçamento).
  flush?: boolean;
};

// Leva sempre à lista da aba, mesmo que o usuário tenha passado pela
// visualização e pela edição antes (o "voltar" do cabeçalho só volta um passo).
export function BackToListButton({ href, flush }: Props) {
  const theme = useTheme();

  return (
    <Pressable
      style={[styles.button, !flush && styles.column]}
      onPress={() => router.dismissTo(href)}
      accessibilityRole="button"
      accessibilityLabel="Voltar para a lista">
      <Ionicons name="arrow-back" size={18} color={theme.primary} />
      <ThemedText type="smallBold" themeColor="primary">
        Voltar
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    paddingVertical: 8,
  },
  column: {
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
    paddingHorizontal: 16,
  },
});
