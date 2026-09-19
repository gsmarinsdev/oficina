import { useState } from 'react';
import { ScrollView } from 'react-native';
import { router } from 'expo-router';

import { createClient } from '@/data/clientsRepository';
import type { ClientInput } from '@/domain/client';
import { ClientForm } from '@/components/ClientForm';
import { SplitScreen } from '@/components/SplitScreen';
import { ThemedText } from '@/components/themed-text';
import { showError } from '@/utils/platformAlert';

export default function NovoClienteScreen() {
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(input: ClientInput) {
    setSubmitting(true);
    try {
      await createClient(input);
      router.back();
    } catch (error) {
      // Erro mais comum aqui: CPF duplicado (a coluna é UNIQUE no banco).
      showError('Não foi possível cadastrar', (error as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SplitScreen image={require('@/assets/images/split-clientes.jpg')}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
        <ThemedText
          type="title"
          style={{ width: '100%', maxWidth: 440, alignSelf: 'center', textAlign: 'center', marginBottom: 8 }}>
          Novo Cliente
        </ThemedText>
        <ClientForm submitLabel="Cadastrar" submitting={submitting} onSubmit={handleSubmit} />
      </ScrollView>
    </SplitScreen>
  );
}
