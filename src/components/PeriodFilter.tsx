import { useState } from 'react';
import { Pressable, StyleSheet, TextInput } from 'react-native';

import { AppFonts } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { displayToIso, isoToDisplay, maskDateInput } from '@/utils/dateMask';
import { PRESETS, rangeFor, type Period } from '@/utils/period';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

type Props = {
  value: Period;
  onChange: (next: Period) => void;
};

// Atalhos de período + campos De/Até. Os campos guardam o texto digitado
// localmente e só avisam a tela quando a data está completa (ou vazia),
// para a consulta não disparar a cada dígito.
export function PeriodFilter({ value, onChange }: Props) {
  const theme = useTheme();
  const [fromText, setFromText] = useState(isoToDisplay(value.range.from));
  const [toText, setToText] = useState(isoToDisplay(value.range.to));
  const inputStyle = [styles.input, { color: theme.text, borderColor: theme.textSecondary }];

  function handlePreset(key: (typeof PRESETS)[number]['key']) {
    const range = rangeFor(key);
    setFromText(isoToDisplay(range.from));
    setToText(isoToDisplay(range.to));
    onChange({ key, range });
  }

  function handleFrom(text: string) {
    const masked = maskDateInput(text);
    setFromText(masked);
    const iso = displayToIso(masked);
    if (iso || masked === '') onChange({ key: 'custom', range: { from: iso, to: value.range.to } });
  }

  function handleTo(text: string) {
    const masked = maskDateInput(text);
    setToText(masked);
    const iso = displayToIso(masked);
    if (iso || masked === '') onChange({ key: 'custom', range: { from: value.range.from, to: iso } });
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.chips}>
        {PRESETS.map((preset) => {
          const active = value.key === preset.key;
          return (
            <Pressable key={preset.key} onPress={() => handlePreset(preset.key)}>
              <ThemedView
                type={active ? 'backgroundSelected' : 'backgroundElement'}
                style={[styles.chip, active && { borderColor: theme.primary }]}>
                <ThemedText type={active ? 'smallBold' : 'small'}>{preset.label}</ThemedText>
              </ThemedView>
            </Pressable>
          );
        })}
      </ThemedView>

      <ThemedView style={styles.dates}>
        <ThemedView style={styles.dateField}>
          <ThemedText type="smallBold">De</ThemedText>
          <TextInput
            style={inputStyle}
            value={fromText}
            onChangeText={handleFrom}
            placeholder="dd/mm/aaaa"
            placeholderTextColor={theme.textSecondary}
            keyboardType="numeric"
            maxLength={10}
          />
        </ThemedView>
        <ThemedView style={styles.dateField}>
          <ThemedText type="smallBold">Até</ThemedText>
          <TextInput
            style={inputStyle}
            value={toText}
            onChangeText={handleTo}
            placeholder="dd/mm/aaaa"
            placeholderTextColor={theme.textSecondary}
            keyboardType="numeric"
            maxLength={10}
          />
        </ThemedView>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  dates: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    gap: 12,
  },
  dateField: {
    gap: 4,
    width: 150,
  },
  input: {
    fontFamily: AppFonts.body,
    borderWidth: 1,
    borderRadius: 6,
    padding: 10,
  },
});
