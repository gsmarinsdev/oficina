import * as Linking from 'expo-linking';
import { Link } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { AuthCard } from '@/components/AuthCard';
import { AuthTextInput } from '@/components/AuthTextInput';
import { ThemedText } from '@/components/themed-text';
import { translateAuthError } from '@/context/auth';
import { supabase } from '@/data/supabaseClient';
import { useTheme } from '@/hooks/use-theme';

export default function RecoverPasswordScreen() {
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSend() {
    if (!email.trim()) {
      setErrorMessage('Informe seu email.');
      return;
    }
    setSubmitting(true);
    setErrorMessage(null);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: Linking.createURL('/nova-senha'),
    });
    setSubmitting(false);
    if (error) setErrorMessage(translateAuthError(error.message));
    else setSent(true);
  }

  return (
    <AuthCard title="Recuperar senha">
      {sent ? (
        <ThemedText style={styles.info}>
          Se o email estiver cadastrado, você receberá um link para definir uma nova senha.
        </ThemedText>
      ) : (
        <>
          <ThemedText type="smallBold">Email</ThemedText>
          <AuthTextInput
            value={email}
            onChangeText={setEmail}
            placeholder="voce@email.com"
            autoComplete="email"
            keyboardType="email-address"
            onSubmitEditing={handleSend}
          />

          {errorMessage && <ThemedText style={styles.errorText}>{errorMessage}</ThemedText>}

          <Pressable
            style={[styles.submitButton, { backgroundColor: theme.primary }]}
            onPress={handleSend}
            disabled={submitting}>
            <ThemedText type="smallBold" style={styles.submitLabel}>
              {submitting ? 'Enviando...' : 'Enviar link'}
            </ThemedText>
          </Pressable>
        </>
      )}

      <Link href="/login" style={styles.link}>
        <ThemedText themeColor="primary" type="smallBold">
          Voltar ao login
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
  info: {
    textAlign: 'center',
  },
  link: {
    alignSelf: 'center',
    marginTop: 12,
  },
});
