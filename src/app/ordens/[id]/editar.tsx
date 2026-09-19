import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, TextInput } from 'react-native';
import { Link, router, useFocusEffect, useLocalSearchParams } from 'expo-router';

import {
  addOrderItem,
  deleteOrder,
  deleteOrderItem,
  getOrder,
  listOrderItems,
  updateOrder,
} from '@/data/serviceOrdersRepository';
import { getClient } from '@/data/clientsRepository';
import { getVehicle } from '@/data/vehiclesRepository';
import type { OrderItemWithService, OrderStatus, ServiceOrder } from '@/domain/serviceOrder';
import type { Service } from '@/domain/service';
import { AppFonts } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { BackToListButton } from '@/components/BackToListButton';
import { CalendarButton } from '@/components/CalendarButton';
import { DateInput } from '@/components/DateInput';
import { PrintOrderButton } from '@/components/PrintOrderButton';
import { ServicePicker } from '@/components/ServicePicker';
import { SplitScreen } from '@/components/SplitScreen';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { joinAgendamento, maskTimeInput, parseTime, splitAgendamento } from '@/utils/calendar';
import { confirmAction, showError } from '@/utils/platformAlert';

const STATUS_OPTIONS: OrderStatus[] = ['aberta', 'em_andamento', 'concluída', 'cancelada'];
const STATUS_LABEL: Record<OrderStatus, string> = {
  aberta: 'Aberta',
  em_andamento: 'Em andamento',
  concluída: 'Concluída',
  cancelada: 'Cancelada',
};

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function OrdemDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();

  const [order, setOrder] = useState<ServiceOrder | null>(null);
  const [clienteNome, setClienteNome] = useState('');
  const [veiculoLabel, setVeiculoLabel] = useState('');
  const [items, setItems] = useState<OrderItemWithService[]>([]);
  const [dataSaida, setDataSaida] = useState<string | null>(null);
  const [agDate, setAgDate] = useState<string | null>(null);
  const [agHora, setAgHora] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [savingDetails, setSavingDetails] = useState(false);

  const [pendingService, setPendingService] = useState<Service | null>(null);
  const [quantidade, setQuantidade] = useState('1');
  const [precoUnit, setPrecoUnit] = useState('');
  const [ajusteMotivo, setAjusteMotivo] = useState('');
  const [addingItem, setAddingItem] = useState(false);

  const load = useCallback(() => {
    getOrder(id).then((o) => {
      setOrder(o);
      setDataSaida(o.data_saida);
      const ag = splitAgendamento(o.agendamento);
      setAgDate(ag.date);
      setAgHora(ag.time);
      setObservacoes(o.observacoes ?? '');
      getClient(o.cliente_id).then((c) => setClienteNome(c.nome));
      getVehicle(o.veiculo_id).then((v) => setVeiculoLabel(`${v.placa} — ${v.marca} ${v.modelo}`));
    });
    listOrderItems(id).then(setItems);
  }, [id]);

  useFocusEffect(load);

  async function handleStatusChange(status: OrderStatus) {
    try {
      // Fechar a OS (concluída) carimba a data de saída automaticamente,
      // se ainda não tiver uma — do jeito que "fechar" funciona na oficina.
      const shouldStampExit = status === 'concluída' && !order?.data_saida;
      await updateOrder(id, { status, ...(shouldStampExit ? { data_saida: todayISO() } : {}) });
      load();
    } catch (error) {
      showError('Não foi possível mudar o status', (error as Error).message);
    }
  }

  async function handleSaveDetails() {
    const hora = agHora ? parseTime(agHora) : null;
    if (agHora && !hora) {
      showError('Hora inválida', 'Use o formato hh:mm, por exemplo 14:30.');
      return;
    }
    setSavingDetails(true);
    try {
      await updateOrder(id, {
        data_saida: dataSaida,
        agendamento: agDate ? joinAgendamento(agDate, hora ?? undefined) : null,
        observacoes: observacoes.trim() || null,
      });
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
      await addOrderItem(id, {
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
      await deleteOrderItem(itemId, id);
      load();
    } catch (error) {
      showError('Não foi possível remover o item', (error as Error).message);
    }
  }

  function handleDeleteOrder() {
    confirmAction('Excluir OS', 'Essa ação não pode ser desfeita. Confirma?', async () => {
      try {
        await deleteOrder(id);
        router.dismissTo('/ordens');
      } catch (error) {
        showError('Não foi possível excluir', (error as Error).message);
      }
    });
  }

  if (!order) {
    return <ActivityIndicator size="large" style={styles.spinner} />;
  }

  const inputStyle = [styles.input, { color: theme.text, borderColor: theme.textSecondary }];

  return (
    <SplitScreen image={require('@/assets/images/garagem.png')}>
      <ScrollView contentContainerStyle={styles.container}>
        <BackToListButton href="/ordens" flush />
        <ThemedText type="title" style={{ textAlign: 'center', marginBottom: 8 }}>
          Ordem de Serviço
        </ThemedText>

        <ThemedText type="smallBold">{clienteNome}</ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.marginBottom}>
          {veiculoLabel}
        </ThemedText>

        {order.orcamento_id && (
          <Link href={{ pathname: '/orcamentos/[id]', params: { id: order.orcamento_id } }} asChild>
            <Pressable style={styles.marginBottom}>
              <ThemedText themeColor="primary" type="small">
                Originada do orçamento →
              </ThemedText>
            </Pressable>
          </Link>
        )}

        <CalendarButton orderId={id} />

        <ThemedText type="smallBold">Status</ThemedText>
        <ThemedView style={styles.statusRow}>
          {STATUS_OPTIONS.map((status) => (
            <Pressable key={status} onPress={() => handleStatusChange(status)}>
              <ThemedView
                type={order.status === status ? 'backgroundSelected' : 'backgroundElement'}
                style={styles.statusPill}>
                <ThemedText type={order.status === status ? 'smallBold' : 'small'}>
                  {STATUS_LABEL[status]}
                </ThemedText>
              </ThemedView>
            </Pressable>
          ))}
        </ThemedView>

        <ThemedText type="smallBold">Data de entrada</ThemedText>
        <ThemedView type="backgroundElement" style={styles.readonlyField}>
          <ThemedText>{order.data_entrada.split('-').reverse().join('/')}</ThemedText>
        </ThemedView>

        <ThemedText type="smallBold">Data de saída</ThemedText>
        <DateInput
          style={inputStyle}
          value={dataSaida}
          onChange={setDataSaida}
          placeholderTextColor={theme.textSecondary}
        />

        <ThemedText type="smallBold">Agendamento (data e hora)</ThemedText>
        <ThemedView style={styles.agendaRow}>
          <DateInput
            style={[inputStyle, styles.agendaDate]}
            value={agDate}
            onChange={setAgDate}
            placeholderTextColor={theme.textSecondary}
          />
          <TextInput
            style={[inputStyle, styles.agendaHora]}
            value={agHora}
            onChangeText={(text) => setAgHora(maskTimeInput(text))}
            placeholder="hh:mm"
            placeholderTextColor={theme.textSecondary}
            keyboardType="numeric"
            maxLength={5}
          />
        </ThemedView>

        <ThemedText type="smallBold">Observações</ThemedText>
        <TextInput
          style={[inputStyle, styles.observacoesInput]}
          value={observacoes}
          onChangeText={setObservacoes}
          placeholder="Detalhes da OS"
          placeholderTextColor={theme.textSecondary}
          multiline
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
          Serviços
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
            <TextInput style={inputStyle} value={quantidade} onChangeText={setQuantidade} keyboardType="numeric" />

            <ThemedText type="small">Preço unitário (R$)</ThemedText>
            <TextInput style={inputStyle} value={precoUnit} onChangeText={setPrecoUnit} keyboardType="decimal-pad" />

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
          Total: R$ {order.total.toFixed(2)}
        </ThemedText>

        <PrintOrderButton orderId={id} />

        <Pressable style={styles.deleteButton} onPress={handleDeleteOrder}>
          <ThemedText themeColor="text">Excluir OS</ThemedText>
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
  agendaRow: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: 'transparent',
  },
  agendaDate: {
    flex: 2,
  },
  agendaHora: {
    flex: 1,
  },
  observacoesInput: {
    minHeight: 160,
    textAlignVertical: 'top',
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
