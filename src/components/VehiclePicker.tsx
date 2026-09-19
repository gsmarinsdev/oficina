import { useEffect, useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet } from 'react-native';

import { listVehiclesByClient } from '@/data/vehiclesRepository';
import type { Vehicle } from '@/domain/vehicle';
import { useTheme } from '@/hooks/use-theme';
import { SplitScreen } from './SplitScreen';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

type Props = {
  clienteId: string | null;
  value: string | null;
  valueLabel: string | null;
  onChange: (veiculoId: string, label: string) => void;
};

// Só pode escolher veículo depois de escolher cliente — a lista já vem
// filtrada (evita cadastrar OS/orçamento com veículo de outro dono).
export function VehiclePicker({ clienteId, value, valueLabel, onChange }: Props) {
  const theme = useTheme();
  const [visible, setVisible] = useState(false);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  useEffect(() => {
    if (visible && clienteId) listVehiclesByClient(clienteId).then(setVehicles);
  }, [visible, clienteId]);

  return (
    <>
      <Pressable
        style={[styles.field, { borderColor: theme.textSecondary, opacity: clienteId ? 1 : 0.5 }]}
        disabled={!clienteId}
        onPress={() => setVisible(true)}>
        <ThemedText themeColor={value ? 'text' : 'textSecondary'}>
          {valueLabel ?? (clienteId ? 'Selecionar veículo' : 'Selecione um cliente primeiro')}
        </ThemedText>
      </Pressable>

      <Modal visible={visible} animationType="slide" onRequestClose={() => setVisible(false)}>
        <SplitScreen image={require('@/assets/images/split-veiculos.jpg')}>
        <ThemedView style={styles.modal}>
          <ThemedText type="subtitle" style={styles.modalTitle}>
            Selecionar veículo
          </ThemedText>

          {vehicles.length === 0 && (
            <ThemedText themeColor="textSecondary" style={styles.empty}>
              Esse cliente ainda não tem veículo cadastrado.
            </ThemedText>
          )}

          <FlatList
            data={vehicles}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => {
                  onChange(item.id, `${item.placa} — ${item.marca} ${item.modelo}`);
                  setVisible(false);
                }}>
                <ThemedView type="backgroundElement" style={styles.row}>
                  <ThemedText type="smallBold">{item.placa}</ThemedText>
                  <ThemedText themeColor="textSecondary">
                    {item.marca} {item.modelo}
                  </ThemedText>
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
