import { StyleSheet, TextInput, type TextInputProps } from 'react-native';

import { AppFonts } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export function AuthTextInput(props: Omit<TextInputProps, 'style'>) {
  const theme = useTheme();

  return (
    <TextInput
      {...props}
      style={[styles.input, { color: theme.text, borderColor: theme.textSecondary }]}
      placeholderTextColor={theme.textSecondary}
      autoCapitalize="none"
    />
  );
}

const styles = StyleSheet.create({
  input: {
    fontFamily: AppFonts.body,
    borderWidth: 1,
    borderRadius: 6,
    padding: 12,
    marginBottom: 8,
  },
});
