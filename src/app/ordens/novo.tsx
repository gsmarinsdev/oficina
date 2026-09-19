import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput } from 'react-native';
import { router } from 'expo-router';

import { addOrderItem, createOrder } from '@/data/serviceOrdersRepository';
import { listBudgetItems } from '@/data/budgetsRepository';
import type { BudgetWithRelations } from '@/domain/budget';
import { AppFonts } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { BudgetPicker } from '@/components/BudgetPicker';
import { ClientPicker } from '@/components/ClientPicker';
import { SplitScreen } from '@/components/SplitScreen';
import { VehiclePicker } from '@/components/VehiclePicker';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { showError } from '@/utils/platformAlert';

export default function NovaOSScreen() {
  const theme = useTheme();
  const [originBudget, setOriginBudget] = useState<BudgetWithRelations | null>(null);
  const [clienteId, setClienteId] = useState<string | null>(null);
  const [clienteNome, setClienteNome] = useState<string | null>(null);
  const [veiculoId, setVeiculoId] = useState<string | null>(null);
  const [veiculoLabel, setVeiculoLabel] = useState<string | null>(null);
  const [observacoes, setObservacoes] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const inputStyle = [styles.input, { color: theme.text, borderColor: theme.textSecondary }];

  // Vindo de um orçamento, cliente e veículo já estão decididos — só direto
  // (sem orçamento) é que pedimos pra escolher na mão.
  const effectiveClienteId = originBudget ? originBudget.cliente_id : clienteId;
  const effectiveVeiculoId = originBudget ? originBudget.veiculo_id : veiculoId;

  async function handleSubmit() {
    if (!effectiveClienteId || !effectiveVeiculoId) {
      setFormError('Selecione o cliente e o veículo (ou um orçamento de origem)');
      return;
    }
    setFormError(null);
    setSubmitting(true);
    try {
      const order = await createOrder({
        cliente_id: effectiveClienteId,
        veiculo_id: effectiveVeiculoId,
        orcamento_id: originBudget?.id ?? null,
        observacoes: observacoes.trim() || null,
      });

      // Se nasceu de um orçamento, os itens dele já entram prontos na OS.
      if (originBudget) {
        const items = await listBudgetItems(originBudget.id);
        for (const item of items) {
          await addOrderItem(order.id, {
            servico_id: item.servico_id,
            quantidade: item.quantidade,
            preco_unit: item.preco_unit,
            ajuste_motivo: item.ajuste_motivo,
          });
        }
      }

      router.replace({ pathname: '/ordens/[id]/editar', params: { id: order.id } });
    } catch (error) {
      showError('Não foi possível abrir a OS', (error as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SplitScreen image={require('@/assets/images/garagem.png')}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
        <ThemedView style={styles.container}>
          <ThemedText type="title" style={styles.title}>
            Nova OS
          </ThemedText>

          <ThemedText type="smallBold">Orçamento de origem</ThemedText>
          <BudgetPicker
            valueLabel={
              originBudget
                ? `${originBudget.clientes?.nome ?? 'Cliente removido'} — R$ ${originBudget.total.toFixed(2)}`
                : null
            }
            onChange={(budget) => {
              setOriginBudget(budget);
              // Se veio de orçamento, o cliente/veículo escolhidos na mão perdem sentido.
              setClienteId(null);
              setClienteNome(null);
              setVeiculoId(null);
              setVeiculoLabel(null);
            }}
          />
          {originBudget && (
            <Pressable onPress={() => setOriginBudget(null)} style={styles.clearBudget}>
              <ThemedText themeColor="primary" type="small">
                Não usar esse orçamento — escolher cliente/veículo direto
              </ThemedText>
            </Pressable>
          )}

          {originBudget ? (
            <>
              <ThemedText type="smallBold">Cliente</ThemedText>
              <ThemedView type="backgroundElement" style={styles.readonlyField}>
                <ThemedText>{originBudget.clientes?.nome ?? 'Cliente removido'}</ThemedText>
              </ThemedView>

              <ThemedText type="smallBold">Veículo</ThemedText>
              <ThemedView type="backgroundElement" style={styles.readonlyField}>
                <ThemedText>
                  {originBudget.veiculos
                    ? `${originBudget.veiculos.placa} — ${originBudget.veiculos.marca} ${originBudget.veiculos.modelo}`
                    : 'Veículo removido'}
                </ThemedText>
              </ThemedView>
            </>
          ) : (
            <>
              <ThemedText type="smallBold">Cliente *</ThemedText>
              <ClientPicker
                value={clienteId}
                valueLabel={clienteNome}
                onChange={(id, nome) => {
                  setClienteId(id);
                  setClienteNome(nome);
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
            </>
          )}

          <ThemedText type="smallBold">Observações</ThemedText>
          <TextInput
            style={[inputStyle, styles.observacoesInput]}
            value={observacoes}
            onChangeText={setObservacoes}
            placeholder="Detalhes da OS"
            placeholderTextColor={theme.textSecondary}
            multiline
          />

          {formError && <ThemedText style={styles.errorText}>{formError}</ThemedText>}

          <Pressable
            style={[styles.submitButton, { backgroundColor: theme.primary }]}
            onPress={handleSubmit}
            disabled={submitting}>
            <ThemedText type="smallBold" style={styles.submitLabel}>
              {submitting ? 'Abrindo...' : 'Abrir OS'}
            </ThemedText>
          </Pressable>
        </ThemedView>
      </ScrollView>
    </SplitScreen>
  );
}

const styles = StyleSheet.create({
  observacoesInput: {
    minHeight: 160,
    textAlignVertical: 'top',
  },
  container: {
    padding: 16,
    gap: 8,
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
  },
  clearBudget: {
    marginBottom: 8,
  },
  readonlyField: {
    borderRadius: 6,
    padding: 12,
    marginBottom: 8,
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
