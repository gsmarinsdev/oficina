import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { AppFonts } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { ThemedText } from './themed-text';

export function PasswordInput(props: Omit<TextInputProps, 'secureTextEntry' | 'style'>) {
  const theme = useTheme();
  const [visible, setVisible] = useState(false);

  return (
    <View style={[styles.wrapper, { borderColor: theme.textSecondary }]}>
      <TextInput
        {...props}
        style={[styles.input, { color: theme.text }]}
        placeholderTextColor={theme.textSecondary}
        secureTextEntry={!visible}
        autoCapitalize="none"
      />
      <Pressable
        style={styles.toggle}
        onPress={() => setVisible((v) => !v)}
        accessibilityRole="button"
        accessibilityLabel={visible ? 'Ocultar senha' : 'Mostrar senha'}>
        <ThemedText themeColor="primary" type="smallBold">
          {visible ? 'Ocultar' : 'Mostrar'}
        </ThemedText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 6,
    marginBottom: 8,
  },
  input: {
    flex: 1,
    fontFamily: AppFonts.body,
    padding: 12,
  },
  toggle: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
});
