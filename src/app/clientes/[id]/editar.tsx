import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

import { deleteClient, getClient, updateClient } from '@/data/clientsRepository';
import type { Client, ClientInput } from '@/domain/client';
import { BackToListButton } from '@/components/BackToListButton';
import { ClientForm } from '@/components/ClientForm';
import { SplitScreen } from '@/components/SplitScreen';
import { ThemedText } from '@/components/themed-text';
import { confirmAction, showError } from '@/utils/platformAlert';

export default function EditarClienteScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [client, setClient] = useState<Client | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getClient(id).then(setClient);
  }, [id]);

  async function handleSubmit(input: ClientInput) {
    setSubmitting(true);
    try {
      await updateClient(id, input);
      router.back();
    } catch (error) {
      showError('Não foi possível salvar', (error as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  function handleDelete() {
    confirmAction('Excluir cliente', 'Essa ação não pode ser desfeita. Confirma?', async () => {
      try {
        await deleteClient(id);
        router.dismissTo('/clientes');
      } catch (error) {
        // Se o cliente tiver veículo/OS vinculado, o próprio banco recusa
        // o DELETE (chave estrangeira) — é o Postgres protegendo os dados.
        showError('Não foi possível excluir', (error as Error).message);
      }
    });
  }

  if (!client) {
    return <ActivityIndicator size="large" style={styles.spinner} />;
  }

  return (
    <SplitScreen image={require('@/assets/images/split-clientes.jpg')}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
        <BackToListButton href="/clientes" />
        <ThemedText
          type="title"
          style={{ width: '100%', maxWidth: 440, alignSelf: 'center', textAlign: 'center', marginBottom: 8 }}>
          Editar Cliente
        </ThemedText>
        <ClientForm initialValue={client} submitLabel="Salvar alterações" submitting={submitting} onSubmit={handleSubmit} />
        <Pressable style={styles.deleteButton} onPress={handleDelete}>
          <ThemedText themeColor="text">Excluir cliente</ThemedText>
        </Pressable>
      </ScrollView>
    </SplitScreen>
  );
}

const styles = StyleSheet.create({
  spinner: {
    marginTop: 48,
  },
  deleteButton: {
    alignItems: 'center',
    paddingVertical: 16,
  },
});
