import { useState } from 'react';
import { Pressable, StyleSheet, TextInput } from 'react-native';

import type { VehicleInput } from '@/domain/vehicle';
import { AppFonts } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { ClientPicker } from './ClientPicker';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

type Props = {
  initialValue?: VehicleInput & { clienteNome?: string | null };
  submitLabel: string;
  onSubmit: (input: VehicleInput) => void;
  submitting: boolean;
};

const EMPTY: VehicleInput = { cliente_id: '', placa: '', marca: '', modelo: '', ano: null, cor: null };

export function VehicleForm({ initialValue = EMPTY, submitLabel, onSubmit, submitting }: Props) {
  const theme = useTheme();
  const [clienteId, setClienteId] = useState(initialValue.cliente_id);
  const [clienteNome, setClienteNome] = useState<string | null>(initialValue.clienteNome ?? null);
  const [placa, setPlaca] = useState(initialValue.placa);
  const [marca, setMarca] = useState(initialValue.marca);
  const [modelo, setModelo] = useState(initialValue.modelo);
  const [ano, setAno] = useState(initialValue.ano ? String(initialValue.ano) : '');
  const [cor, setCor] = useState(initialValue.cor ?? '');
  const [formError, setFormError] = useState<string | null>(null);
  const inputStyle = [styles.input, { color: theme.text, borderColor: theme.textSecondary }];

  function handleSubmit() {
    if (!clienteId) {
      setFormError('Selecione um cliente');
      return;
    }
    if (!placa.trim() || !marca.trim() || !modelo.trim()) {
      setFormError('Placa, marca e modelo são obrigatórios');
      return;
    }
    setFormError(null);
    onSubmit({
      cliente_id: clienteId,
      placa: placa.trim().toUpperCase(),
      marca: marca.trim(),
      modelo: modelo.trim(),
      ano: ano.trim() ? Number(ano) : null,
      cor: cor.trim() || null,
    });
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="smallBold">Cliente *</ThemedText>
      <ClientPicker
        value={clienteId || null}
        valueLabel={clienteNome}
        onChange={(id, nome) => {
          setClienteId(id);
          setClienteNome(nome);
        }}
      />

      <ThemedText type="smallBold">Placa *</ThemedText>
      <TextInput
        style={inputStyle}
        value={placa}
        onChangeText={setPlaca}
        placeholder="ABC1D23"
        placeholderTextColor={theme.textSecondary}
        autoCapitalize="characters"
      />

      <ThemedText type="smallBold">Marca *</ThemedText>
      <TextInput
        style={inputStyle}
        value={marca}
        onChangeText={setMarca}
        placeholder="Ex: Volkswagen"
        placeholderTextColor={theme.textSecondary}
      />

      <ThemedText type="smallBold">Modelo *</ThemedText>
      <TextInput
        style={inputStyle}
        value={modelo}
        onChangeText={setModelo}
        placeholder="Ex: Gol"
        placeholderTextColor={theme.textSecondary}
      />

      <ThemedText type="smallBold">Ano</ThemedText>
      <TextInput
        style={inputStyle}
        value={ano}
        onChangeText={setAno}
        placeholder="2020"
        placeholderTextColor={theme.textSecondary}
        keyboardType="numeric"
      />

      <ThemedText type="smallBold">Cor</ThemedText>
      <TextInput
        style={inputStyle}
        value={cor}
        onChangeText={setCor}
        placeholder="Ex: Prata"
        placeholderTextColor={theme.textSecondary}
      />

      {formError && <ThemedText style={styles.errorText}>{formError}</ThemedText>}

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
