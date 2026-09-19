import { useEffect, useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet } from 'react-native';

import { listServices } from '@/data/servicesRepository';
import type { Service } from '@/domain/service';
import { useTheme } from '@/hooks/use-theme';
import { SplitScreen } from './SplitScreen';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

type Props = {
  onChange: (service: Service) => void;
};

// Ao contrário do ClientPicker/VehiclePicker, este não guarda "valor
// selecionado" — cada seleção vira um novo item na lista do orçamento,
// então o campo volta a ficar pronto pra adicionar o próximo.
export function ServicePicker({ onChange }: Props) {
  const theme = useTheme();
  const [visible, setVisible] = useState(false);
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    if (visible) listServices().then(setServices);
  }, [visible]);

  return (
    <>
      <Pressable
        style={[styles.addButton, { backgroundColor: theme.primary }]}
        onPress={() => setVisible(true)}>
        <ThemedText type="smallBold" style={styles.addButtonLabel}>
          + Adicionar serviço
        </ThemedText>
      </Pressable>

      <Modal visible={visible} animationType="slide" onRequestClose={() => setVisible(false)}>
        <SplitScreen image={require('@/assets/images/split-servicos.jpg')}>
        <ThemedView style={styles.modal}>
          <ThemedText type="subtitle" style={styles.modalTitle}>
            Selecionar serviço
          </ThemedText>

          {services.length === 0 && (
            <ThemedText themeColor="textSecondary" style={styles.empty}>
              Nenhum serviço cadastrado ainda. Cadastre na aba Serviços primeiro.
            </ThemedText>
          )}

          <FlatList
            data={services}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => {
                  onChange(item);
                  setVisible(false);
                }}>
                <ThemedView type="backgroundElement" style={styles.row}>
                  <ThemedText type="smallBold">{item.nome}</ThemedText>
                  <ThemedText themeColor="textSecondary">R$ {item.preco_base.toFixed(2)}</ThemedText>
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
  addButton: {
    borderRadius: 6,
    paddingVertical: 12,
    alignItems: 'center',
  },
  addButtonLabel: {
    color: '#FFFFFF',
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
