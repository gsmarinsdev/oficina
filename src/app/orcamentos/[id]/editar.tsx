import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, TextInput } from 'react-native';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';

import {
  addBudgetItem,
  deleteBudget,
  deleteBudgetItem,
  getBudget,
  listBudgetItems,
  updateBudgetDetails,
  updateBudgetStatus,
} from '@/data/budgetsRepository';
import { getClient } from '@/data/clientsRepository';
import { getVehicle } from '@/data/vehiclesRepository';
import type { Budget, BudgetItemWithService, BudgetStatus } from '@/domain/budget';
import type { Service } from '@/domain/service';
import { AppFonts } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { BackToListButton } from '@/components/BackToListButton';
import { DateInput } from '@/components/DateInput';
import { ServicePicker } from '@/components/ServicePicker';
import { SplitScreen } from '@/components/SplitScreen';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { confirmAction, showError } from '@/utils/platformAlert';

const STATUS_OPTIONS: BudgetStatus[] = ['pendente', 'aceito', 'recusado', 'expirado'];
const STATUS_LABEL: Record<BudgetStatus, string> = {
  pendente: 'Pendente',
  aceito: 'Aceito',
  recusado: 'Recusado',
  expirado: 'Expirado',
};

export default function OrcamentoDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();

  const [budget, setBudget] = useState<Budget | null>(null);
  const [clienteNome, setClienteNome] = useState('');
  const [veiculoLabel, setVeiculoLabel] = useState('');
  const [items, setItems] = useState<BudgetItemWithService[]>([]);
  const [validade, setValidade] = useState<string | null>(null);
  const [observacoes, setObservacoes] = useState('');
  const [savingDetails, setSavingDetails] = useState(false);

  // Formulário de "adicionar item", só aparece depois de escolher o serviço.
  const [pendingService, setPendingService] = useState<Service | null>(null);
  const [quantidade, setQuantidade] = useState('1');
  const [precoUnit, setPrecoUnit] = useState('');
  const [ajusteMotivo, setAjusteMotivo] = useState('');
  const [addingItem, setAddingItem] = useState(false);

  const load = useCallback(() => {
    getBudget(id).then((b) => {
      setBudget(b);
      setValidade(b.validade);
      setObservacoes(b.observacoes ?? '');
      getClient(b.cliente_id).then((c) => setClienteNome(c.nome));
      getVehicle(b.veiculo_id).then((v) => setVeiculoLabel(`${v.placa} — ${v.marca} ${v.modelo}`));
    });
    listBudgetItems(id).then(setItems);
  }, [id]);

  useFocusEffect(load);

  async function handleStatusChange(status: BudgetStatus) {
    try {
      await updateBudgetStatus(id, status);
      load();
    } catch (error) {
      showError('Não foi possível mudar o status', (error as Error).message);
    }
  }

  async function handleSaveDetails() {
    setSavingDetails(true);
    try {
      await updateBudgetDetails(id, { validade, observacoes: observacoes.trim() || null });
    } catch (error) {
      showError('Não foi possível salvar', (error as Error).message);
    } finally {
      setSavingDetails(false);
    }
  }

  function handlePickService(service: Service) {
    setPendingService(service);
    setQuantidade('1');
    setPrecoUnit(String(service.preco_base));
    setAjusteMotivo('');
  }

  async function handleConfirmAddItem() {
    if (!pendingService) return;
    const qtd = Number(quantidade);
    const preco = Number(precoUnit.replace(',', '.'));
    if (!qtd || qtd <= 0 || Number.isNaN(preco) || preco < 0) {
      showError('Dados inválidos', 'Confira quantidade e preço unitário.');
      return;
    }
    setAddingItem(true);
    try {
      await addBudgetItem(id, {
        servico_id: pendingService.id,
        quantidade: qtd,
        preco_unit: preco,
        ajuste_motivo: ajusteMotivo.trim() || null,
      });
      setPendingService(null);
      load();
    } catch (error) {
      showError('Não foi possível adicionar o item', (error as Error).message);
    } finally {
      setAddingItem(false);
    }
  }

  async function handleDeleteItem(itemId: string) {
    try {
      await deleteBudgetItem(itemId, id);
      load();
    } catch (error) {
      showError('Não foi possível remover o item', (error as Error).message);
    }
  }

  function handleDeleteBudget() {
    confirmAction('Excluir orçamento', 'Essa ação não pode ser desfeita. Confirma?', async () => {
      try {
        await deleteBudget(id);
        router.dismissTo('/orcamentos');
      } catch (error) {
        // Se já virou uma OS (ordens_servico.orcamento_id), o banco recusa o DELETE.
        showError('Não foi possível excluir', (error as Error).message);
      }
    });
  }

  if (!budget) {
    return <ActivityIndicator size="large" style={styles.spinner} />;
  }

  const inputStyle = [styles.input, { color: theme.text, borderColor: theme.textSecondary }];

  return (
    <SplitScreen image={require('@/assets/images/split-orcamentos.jpg')}>
      <ScrollView contentContainerStyle={styles.container}>
      <BackToListButton href="/orcamentos" flush />
      <ThemedText type="title" style={{ textAlign: 'center', marginBottom: 8 }}>
        Orçamento
      </ThemedText>
      <ThemedText type="smallBold">{clienteNome}</ThemedText>
      <ThemedText themeColor="textSecondary" style={styles.marginBottom}>
        {veiculoLabel}
      </ThemedText>

      <ThemedText type="smallBold">Status</ThemedText>
      <ThemedView style={styles.statusRow}>
        {STATUS_OPTIONS.map((status) => (
          <Pressable key={status} onPress={() => handleStatusChange(status)}>
            <ThemedView
              type={budget.status === status ? 'backgroundSelected' : 'backgroundElement'}
              style={styles.statusPill}>
              <ThemedText type={budget.status === status ? 'smallBold' : 'small'}>
                {STATUS_LABEL[status]}
              </ThemedText>
            </ThemedView>
          </Pressable>
        ))}
      </ThemedView>

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

      <Pressable
        style={[styles.confirmDetailsButton, { backgroundColor: theme.primary }]}
        onPress={handleSaveDetails}
        disabled={savingDetails}>
        <ThemedText type="smallBold" style={styles.submitLabel}>
          {savingDetails ? 'Salvando...' : 'Confirmar alterações'}
        </ThemedText>
      </Pressable>

      <ThemedText type="subtitle" style={styles.sectionTitle}>
        Itens
      </ThemedText>

      {items.length === 0 && (
        <ThemedText themeColor="textSecondary" style={styles.empty}>
          Nenhum serviço adicionado ainda.
        </ThemedText>
      )}

      {items.map((item) => (
        <ThemedView key={item.id} type="backgroundElement" style={styles.itemRow}>
          <ThemedView style={styles.itemInfo}>
            <ThemedText type="smallBold">{item.servicos?.nome ?? 'Serviço removido'}</ThemedText>
            <ThemedText themeColor="textSecondary">
              {item.quantidade} x R$ {item.preco_unit.toFixed(2)} = R$ {item.subtotal.toFixed(2)}
            </ThemedText>
            {item.ajuste_motivo && (
              <ThemedText themeColor="textSecondary" style={styles.italic}>
                {item.ajuste_motivo}
              </ThemedText>
            )}
          </ThemedView>
          <Pressable onPress={() => handleDeleteItem(item.id)}>
            <ThemedText style={styles.errorText}>Remover</ThemedText>
          </Pressable>
        </ThemedView>
      ))}

      {pendingService && (
        <ThemedView type="backgroundElement" style={styles.pendingForm}>
          <ThemedText type="smallBold">{pendingService.nome}</ThemedText>

          <ThemedText type="small">Quantidade</ThemedText>
          <TextInput
            style={inputStyle}
            value={quantidade}
            onChangeText={setQuantidade}
            keyboardType="numeric"
          />

          <ThemedText type="small">Preço unitário (R$)</ThemedText>
          <TextInput
            style={inputStyle}
            value={precoUnit}
            onChangeText={setPrecoUnit}
            keyboardType="decimal-pad"
          />

          <ThemedText type="small">Motivo do ajuste (se o preço fugir do catálogo)</ThemedText>
          <TextInput
            style={inputStyle}
            value={ajusteMotivo}
            onChangeText={setAjusteMotivo}
            placeholder="Opcional"
            placeholderTextColor={theme.textSecondary}
          />

          <ThemedView style={styles.pendingActions}>
            <Pressable onPress={() => setPendingService(null)}>
              <ThemedText themeColor="textSecondary">Cancelar</ThemedText>
            </Pressable>
            <Pressable
              style={[styles.confirmButton, { backgroundColor: theme.primary }]}
              onPress={handleConfirmAddItem}
              disabled={addingItem}>
              <ThemedText type="smallBold" style={styles.submitLabel}>
                {addingItem ? 'Adicionando...' : 'Adicionar'}
              </ThemedText>
            </Pressable>
          </ThemedView>
        </ThemedView>
      )}

      {!pendingService && <ServicePicker onChange={handlePickService} />}

      <ThemedText type="subtitle" style={styles.total}>
        Total: R$ {budget.total.toFixed(2)}
      </ThemedText>

      <Pressable style={styles.deleteButton} onPress={handleDeleteBudget}>
        <ThemedText themeColor="text">Excluir orçamento</ThemedText>
      </Pressable>
      </ScrollView>
    </SplitScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 32,
    gap: 8,
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
  },
  marginBottom: {
    marginBottom: 8,
  },
  spinner: {
    marginTop: 48,
  },
  statusRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
    backgroundColor: 'transparent',
  },
  statusPill: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  input: {
    fontFamily: AppFonts.body,
    borderWidth: 1,
    borderRadius: 6,
    padding: 12,
    marginBottom: 8,
  },
  confirmDetailsButton: {
    borderRadius: 6,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    marginTop: 16,
    marginBottom: 8,
  },
  empty: {
    textAlign: 'center',
    marginTop: 8,
  },
  itemRow: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  itemInfo: {
    flex: 1,
    gap: 2,
    backgroundColor: 'transparent',
  },
  italic: {
    fontStyle: 'italic',
  },
  pendingForm: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    gap: 4,
  },
  pendingActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 16,
    marginTop: 8,
    backgroundColor: 'transparent',
  },
  confirmButton: {
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  submitLabel: {
    color: '#FFFFFF',
  },
  errorText: {
    color: '#C0392B',
  },
  total: {
    marginTop: 16,
    textAlign: 'right',
  },
  deleteButton: {
    alignItems: 'center',
    paddingVertical: 16,
    marginTop: 8,
  },
});
