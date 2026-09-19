import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { useTheme } from '@/hooks/use-theme';
import { printOrder } from '@/utils/printOrder';
import { showError } from '@/utils/platformAlert';
import { ThemedText } from './themed-text';

export function PrintOrderButton({ orderId }: { orderId: string }) {
  const theme = useTheme();
  const [printing, setPrinting] = useState(false);

  async function handlePrint() {
    setPrinting(true);
    try {
      await printOrder(orderId);
    } catch (error) {
      showError('Não foi possível gerar o PDF', (error as Error).message);
    } finally {
      setPrinting(false);
    }
  }

  return (
    <Pressable
      style={[styles.button, { borderColor: theme.primary }]}
      onPress={handlePrint}
      disabled={printing}>
      <Ionicons name="print-outline" size={18} color={theme.primary} />
      <ThemedText type="smallBold" themeColor="primary">
        {printing ? 'Gerando...' : 'Imprimir Ordem'}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderRadius: 6,
    paddingVertical: 12,
  },
});
