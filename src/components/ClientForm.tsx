import { useState } from 'react';
import { Pressable, StyleSheet, TextInput } from 'react-native';

import type { ClientInput } from '@/domain/client';
import { AppFonts } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

type Props = {
  initialValue?: ClientInput;
  submitLabel: string;
  onSubmit: (input: ClientInput) => void;
  submitting: boolean;
};

const EMPTY: ClientInput = { nome: '', telefone: null, email: null, cpf: null, endereco: null };

export function ClientForm({ initialValue = EMPTY, submitLabel, onSubmit, submitting }: Props) {
  const theme = useTheme();
  const [nome, setNome] = useState(initialValue.nome);
  const [telefone, setTelefone] = useState(initialValue.telefone ?? '');
  const [email, setEmail] = useState(initialValue.email ?? '');
  const [cpf, setCpf] = useState(initialValue.cpf ?? '');
  const [endereco, setEndereco] = useState(initialValue.endereco ?? '');
  const [nomeError, setNomeError] = useState<string | null>(null);
  const inputStyle = [styles.input, { color: theme.text, borderColor: theme.textSecondary }];

  function handleSubmit() {
    if (!nome.trim()) {
      setNomeError('Nome é obrigatório');
      return;
    }
    setNomeError(null);
    onSubmit({
      nome: nome.trim(),
      telefone: telefone.trim() || null,
      email: email.trim() || null,
      cpf: cpf.trim() || null,
      endereco: endereco.trim() || null,
    });
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="smallBold">Nome *</ThemedText>
      <TextInput
        style={inputStyle}
        value={nome}
        onChangeText={setNome}
        placeholder="Nome completo"
        placeholderTextColor={theme.textSecondary}
      />
      {/* Vermelho de erro: a identidade visual não define uma cor de erro,
          então usamos um vermelho neutro em vez do laranja (reservado para
          ações/destaques, não para estados de erro). */}
      {nomeError && <ThemedText style={styles.errorText}>{nomeError}</ThemedText>}

      <ThemedText type="smallBold">Telefone</ThemedText>
      <TextInput
        style={inputStyle}
        value={telefone}
        onChangeText={setTelefone}
        placeholder="(00) 00000-0000"
        placeholderTextColor={theme.textSecondary}
        keyboardType="phone-pad"
      />

      <ThemedText type="smallBold">E-mail</ThemedText>
      <TextInput
        style={inputStyle}
        value={email}
        onChangeText={setEmail}
        placeholder="email@exemplo.com"
        placeholderTextColor={theme.textSecondary}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <ThemedText type="smallBold">CPF</ThemedText>
      <TextInput
        style={inputStyle}
        value={cpf}
        onChangeText={setCpf}
        placeholder="000.000.000-00"
        placeholderTextColor={theme.textSecondary}
      />

      <ThemedText type="smallBold">Endereço</ThemedText>
      <TextInput
        style={inputStyle}
        value={endereco}
        onChangeText={setEndereco}
        placeholder="Rua, número, bairro"
        placeholderTextColor={theme.textSecondary}
      />

      <Pressable
        style={[styles.submitButton, { backgroundColor: theme.primary }]}
        onPress={handleSubmit}
        disabled={submitting}>
        <ThemedText type="smallBold" style={styles.submitLabel}>
          {submitting ? 'Salvando...' : submitLabel}
        </ThemedText>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 8,
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
  },
  input: {
    fontFamily: AppFonts.body,
    borderWidth: 1,
    borderRadius: 6,
    padding: 12,
    marginBottom: 8,
  },
  submitButton: {
    borderRadius: 6,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  submitLabel: {
    color: '#FFFFFF',
  },
  errorText: {
    color: '#C0392B',
  },
});
