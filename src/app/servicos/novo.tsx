import { useState } from 'react';
import { ScrollView } from 'react-native';
import { router } from 'expo-router';

import { createService } from '@/data/servicesRepository';
import type { ServiceInput } from '@/domain/service';
import { ServiceForm } from '@/components/ServiceForm';
import { SplitScreen } from '@/components/SplitScreen';
import { ThemedText } from '@/components/themed-text';
import { showError } from '@/utils/platformAlert';

export default function NovoServicoScreen() {
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(input: ServiceInput) {
    setSubmitting(true);
    try {
      await createService(input);
      router.back();
    } catch (error) {
      showError('Não foi possível cadastrar', (error as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SplitScreen image={require('@/assets/images/split-servicos.jpg')}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
        <ThemedText
          type="title"
          style={{ width: '100%', maxWidth: 440, alignSelf: 'center', textAlign: 'center', marginBottom: 8 }}>
          Novo Serviço
        </ThemedText>
        <ServiceForm submitLabel="Cadastrar" submitting={submitting} onSubmit={handleSubmit} />
      </ScrollView>
    </SplitScreen>
  );
}
