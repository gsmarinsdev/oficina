import { useEffect, useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, TextInput } from 'react-native';

import { listClients } from '@/data/clientsRepository';
import type { Client } from '@/domain/client';
import { AppFonts } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { SplitScreen } from './SplitScreen';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

type Props = {
  value: string | null;
  valueLabel: string | null;
  onChange: (clientId: string, clientName: string) => void;
};

export function ClientPicker({ value, valueLabel, onChange }: Props) {
  const theme = useTheme();
  const [visible, setVisible] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (visible) listClients().then(setClients);
  }, [visible]);

  const filtered = useMemo(
    () => clients.filter((c) => c.nome.toLowerCase().includes(search.trim().toLowerCase())),
    [clients, search]
  );

  return (
    <>
      <Pressable
        style={[styles.field, { borderColor: theme.textSecondary }]}
        onPress={() => setVisible(true)}>
        <ThemedText themeColor={value ? 'text' : 'textSecondary'}>
          {valueLabel ?? 'Selecionar cliente'}
        </ThemedText>
      </Pressable>

      <Modal visible={visible} animationType="slide" onRequestClose={() => setVisible(false)}>
        <SplitScreen image={require('@/assets/images/split-clientes.jpg')}>
        <ThemedView style={styles.modal}>
          <ThemedText type="subtitle" style={styles.modalTitle}>
            Selecionar cliente
          </ThemedText>

          <TextInput
            style={[styles.search, { color: theme.text, borderColor: theme.textSecondary }]}
            placeholder="Buscar por nome..."
            placeholderTextColor={theme.textSecondary}
            value={search}
            onChangeText={setSearch}
            autoFocus
          />

          {clients.length === 0 && (
            <ThemedText themeColor="textSecondary" style={styles.empty}>
              Nenhum cliente cadastrado ainda. Cadastre um cliente antes de adicionar um veículo.
            </ThemedText>
          )}

          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => {
                  onChange(item.id, item.nome);
                  setVisible(false);
                  setSearch('');
                }}>
                <ThemedView type="backgroundElement" style={styles.row}>
                  <ThemedText type="smallBold">{item.nome}</ThemedText>
                  {item.telefone && <ThemedText themeColor="textSecondary">{item.telefone}</ThemedText>}
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
  search: {
    fontFamily: AppFonts.body,
    borderWidth: 1,
    borderRadius: 6,
    padding: 12,
    marginBottom: 12,
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
