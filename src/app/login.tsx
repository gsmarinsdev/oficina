import { Link } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { AuthCard } from '@/components/AuthCard';
import { AuthTextInput } from '@/components/AuthTextInput';
import { PasswordInput } from '@/components/PasswordInput';
import { ThemedText } from '@/components/themed-text';
import { translateAuthError } from '@/context/auth';
import { supabase } from '@/data/supabaseClient';
import { useTheme } from '@/hooks/use-theme';

export default function LoginScreen() {
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleLogin() {
    if (!email.trim() || !senha) {
      setErrorMessage('Informe email e senha.');
      return;
    }
    setSubmitting(true);
    setErrorMessage(null);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: senha });
    setSubmitting(false);
    if (error) setErrorMessage(translateAuthError(error.message));
  }

  return (
    <AuthCard title="Entrar">
      <ThemedText type="smallBold">Email</ThemedText>
      <AuthTextInput
        value={email}
        onChangeText={setEmail}
        placeholder="voce@email.com"
        autoComplete="email"
        keyboardType="email-address"
      />

      <ThemedText type="smallBold">Senha</ThemedText>
      <PasswordInput
        value={senha}
        onChangeText={setSenha}
        placeholder="Sua senha"
        autoComplete="current-password"
        onSubmitEditing={handleLogin}
      />

      {errorMessage && <ThemedText style={styles.errorText}>{errorMessage}</ThemedText>}

      <Pressable
        style={[styles.submitButton, { backgroundColor: theme.primary }]}
        onPress={handleLogin}
        disabled={submitting}>
        <ThemedText type="smallBold" style={styles.submitLabel}>
          {submitting ? 'Entrando...' : 'Entrar'}
        </ThemedText>
      </Pressable>

      <Link href="/recuperar-senha" style={styles.link}>
        <ThemedText themeColor="primary" type="smallBold">
          Esqueci a senha
        </ThemedText>
      </Link>
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
  link: {
    alignSelf: 'center',
    marginTop: 12,
  },
});
