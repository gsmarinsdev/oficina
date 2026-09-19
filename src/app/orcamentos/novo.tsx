import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput } from 'react-native';
import { router } from 'expo-router';

import { createBudget } from '@/data/budgetsRepository';
import { AppFonts } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { ClientPicker } from '@/components/ClientPicker';
import { DateInput } from '@/components/DateInput';
import { SplitScreen } from '@/components/SplitScreen';
import { VehiclePicker } from '@/components/VehiclePicker';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { showError } from '@/utils/platformAlert';

export default function NovoOrcamentoScreen() {
  const theme = useTheme();
  const [clienteId, setClienteId] = useState<string | null>(null);
  const [clienteNome, setClienteNome] = useState<string | null>(null);
  const [veiculoId, setVeiculoId] = useState<string | null>(null);
  const [veiculoLabel, setVeiculoLabel] = useState<string | null>(null);
  const [validade, setValidade] = useState<string | null>(null);
  const [observacoes, setObservacoes] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const inputStyle = [styles.input, { color: theme.text, borderColor: theme.textSecondary }];

  async function handleSubmit() {
    if (!clienteId || !veiculoId) {
      setFormError('Selecione o cliente e o veículo');
      return;
    }
    setFormError(null);
    setSubmitting(true);
    try {
      const budget = await createBudget({
        cliente_id: clienteId,
        veiculo_id: veiculoId,
        validade,
        observacoes: observacoes.trim() || null,
      });
      // Troca a tela de criação pela de detalhe, onde os itens são
      // adicionados — evita que "voltar" reabra este formulário vazio.
      router.replace({ pathname: '/orcamentos/[id]/editar', params: { id: budget.id } });
    } catch (error) {
      showError('Não foi possível criar o orçamento', (error as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SplitScreen image={require('@/assets/images/split-orcamentos.jpg')}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
      <ThemedView style={styles.container}>
      <ThemedText type="title" style={{ textAlign: 'center', marginBottom: 8 }}>
        Novo Orçamento
      </ThemedText>
      <ThemedText type="smallBold">Cliente *</ThemedText>
      <ClientPicker
        value={clienteId}
        valueLabel={clienteNome}
        onChange={(id, nome) => {
          setClienteId(id);
          setClienteNome(nome);
          // Veículo pertence a um cliente só — troca de cliente invalida a escolha anterior.
          setVeiculoId(null);
          setVeiculoLabel(null);
        }}
      />

      <ThemedText type="smallBold">Veículo *</ThemedText>
      <VehiclePicker
        clienteId={clienteId}
        value={veiculoId}
        valueLabel={veiculoLabel}
        onChange={(id, label) => {
          setVeiculoId(id);
          setVeiculoLabel(label);
        }}
      />

      <ThemedText type="smallBold">Validade</ThemedText>
      <DateInput
        style={inputStyle}
        value={validade}
        onChange={setValidade}
        placeholderTextColor={theme.textSecondary}
      />

      <ThemedText type="smallBold">Observações</ThemedText>
      <TextInput
        style={inputStyle}
        value={observacoes}
        onChangeText={setObservacoes}
        placeholder="Detalhes do orçamento"
        placeholderTextColor={theme.textSecondary}
      />

      {formError && <ThemedText style={styles.errorText}>{formError}</ThemedText>}

      <Pressable
        style={[styles.submitButton, { backgroundColor: theme.primary }]}
        onPress={handleSubmit}
        disabled={submitting}>
        <ThemedText type="smallBold" style={styles.submitLabel}>
          {submitting ? 'Criando...' : 'Criar orçamento'}
        </ThemedText>
      </Pressable>
      </ThemedView>
      </ScrollView>
    </SplitScreen>
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
