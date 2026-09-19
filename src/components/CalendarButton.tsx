import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { useTheme } from '@/hooks/use-theme';
import { openOrderInGoogleCalendar } from '@/utils/calendar';
import { showError } from '@/utils/platformAlert';
import { ThemedText } from './themed-text';

export function CalendarButton({ orderId }: { orderId: string }) {
  const theme = useTheme();
  const [opening, setOpening] = useState(false);

  async function handlePress() {
    setOpening(true);
    try {
      await openOrderInGoogleCalendar(orderId);
    } catch (error) {
      showError('Não foi possível abrir o Google Agenda', (error as Error).message);
    } finally {
      setOpening(false);
    }
  }

  return (
    <Pressable
      style={[styles.button, { borderColor: theme.primary }]}
      onPress={handlePress}
      disabled={opening}>
      <Ionicons name="calendar-outline" size={18} color={theme.primary} />
      <ThemedText type="smallBold" themeColor="primary">
        {opening ? 'Abrindo...' : 'Adicionar ao Google Agenda'}
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
