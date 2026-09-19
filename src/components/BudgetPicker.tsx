import { useEffect, useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet } from 'react-native';

import { listAcceptedBudgets } from '@/data/budgetsRepository';
import type { BudgetWithRelations } from '@/domain/budget';
import { useTheme } from '@/hooks/use-theme';
import { SplitScreen } from './SplitScreen';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

type Props = {
  valueLabel: string | null;
  onChange: (budget: BudgetWithRelations) => void;
};

// Lista só orçamentos com status 'aceito' — são os únicos que podem virar OS.
export function BudgetPicker({ valueLabel, onChange }: Props) {
  const theme = useTheme();
  const [visible, setVisible] = useState(false);
  const [budgets, setBudgets] = useState<BudgetWithRelations[]>([]);

  useEffect(() => {
    if (visible) listAcceptedBudgets().then(setBudgets);
  }, [visible]);

  return (
    <>
      <Pressable
        style={[styles.field, { borderColor: theme.textSecondary }]}
        onPress={() => setVisible(true)}>
        <ThemedText themeColor={valueLabel ? 'text' : 'textSecondary'}>
          {valueLabel ?? 'Selecionar orçamento aceito'}
        </ThemedText>
      </Pressable>

      <Modal visible={visible} animationType="slide" onRequestClose={() => setVisible(false)}>
        <SplitScreen image={require('@/assets/images/split-orcamentos.jpg')}>
          <ThemedView style={styles.modal}>
            <ThemedText type="subtitle" style={styles.modalTitle}>
              Selecionar orçamento aceito
            </ThemedText>

            {budgets.length === 0 && (
              <ThemedText themeColor="textSecondary" style={styles.empty}>
                Nenhum orçamento aceito no momento.
              </ThemedText>
            )}

            <FlatList
              data={budgets}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => {
                    onChange(item);
                    setVisible(false);
                  }}>
                  <ThemedView type="backgroundElement" style={styles.row}>
                    <ThemedText type="smallBold">{item.clientes?.nome ?? 'Cliente removido'}</ThemedText>
                    <ThemedText themeColor="textSecondary">
                      {item.veiculos ? `${item.veiculos.placa} — ${item.veiculos.marca} ${item.veiculos.modelo}` : 'Veículo removido'}
                    </ThemedText>
                    <ThemedText themeColor="textSecondary">R$ {item.total.toFixed(2)}</ThemedText>
                  </ThemedView>
                </Pressable>
              )}
            />

            <Pressable style={styles.cancelButton} onPress={() => setVisible(false)}>
              <ThemedText themeColor="primary" type="smallBold">
                Cancelar
              </ThemedText>
            </Pressable>
          </ThemedView>
        </SplitScreen>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  field: {
    borderWidth: 1,
    borderRadius: 6,
    padding: 12,
    marginBottom: 8,
  },
  modal: {
    flex: 1,
    padding: 16,
    paddingTop: 48,
  },
  modalTitle: {
    marginBottom: 16,
  },
  empty: {
    textAlign: 'center',
    marginTop: 24,
  },
  row: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    gap: 4,
  },
  cancelButton: {
    alignItems: 'center',
    paddingVertical: 16,
  },
});
