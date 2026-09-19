import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { AuthCard } from '@/components/AuthCard';
import { PasswordInput } from '@/components/PasswordInput';
import { ThemedText } from '@/components/themed-text';
import { translateAuthError } from '@/context/auth';
import { supabase } from '@/data/supabaseClient';
import { useTheme } from '@/hooks/use-theme';

export default function NewPasswordScreen() {
  const theme = useTheme();
  const [senha, setSenha] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSave() {
    if (senha.length < 6) {
      setErrorMessage('A senha precisa ter ao menos 6 caracteres.');
      return;
    }
    if (senha !== confirmacao) {
      setErrorMessage('As senhas não conferem.');
      return;
    }
    setSubmitting(true);
    setErrorMessage(null);
    const { error } = await supabase.auth.updateUser({ password: senha });
    setSubmitting(false);
    if (error) setErrorMessage(translateAuthError(error.message));
    else router.replace('/');
  }

  return (
    <AuthCard title="Nova senha">
      <ThemedText type="smallBold">Nova senha</ThemedText>
      <PasswordInput value={senha} onChangeText={setSenha} autoComplete="new-password" />

      <ThemedText type="smallBold">Confirmar senha</ThemedText>
      <PasswordInput
        value={confirmacao}
        onChangeText={setConfirmacao}
        autoComplete="new-password"
        onSubmitEditing={handleSave}
      />

      {errorMessage && <ThemedText style={styles.errorText}>{errorMessage}</ThemedText>}

      <Pressable
        style={[styles.submitButton, { backgroundColor: theme.primary }]}
        onPress={handleSave}
        disabled={submitting}>
        <ThemedText type="smallBold" style={styles.submitLabel}>
          {submitting ? 'Salvando...' : 'Salvar nova senha'}
        </ThemedText>
      </Pressable>
    </AuthCard>
  );
}

const styles = StyleSheet.create({
  submitButton: {
    borderRadius: 6,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  submitLabel: {
    color: '#FFFFFF',
  },
  errorText: {
    color: '#C0392B',
  },
});
