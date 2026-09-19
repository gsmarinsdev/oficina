import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

import { deleteService, getService, updateService } from '@/data/servicesRepository';
import type { Service, ServiceInput } from '@/domain/service';
import { BackToListButton } from '@/components/BackToListButton';
import { ServiceForm } from '@/components/ServiceForm';
import { SplitScreen } from '@/components/SplitScreen';
import { ThemedText } from '@/components/themed-text';
import { confirmAction, showError } from '@/utils/platformAlert';

export default function EditarServicoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [service, setService] = useState<Service | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getService(id).then(setService);
  }, [id]);

  async function handleSubmit(input: ServiceInput) {
    setSubmitting(true);
    try {
      await updateService(id, input);
      router.back();
    } catch (error) {
      showError('Não foi possível salvar', (error as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  function handleDelete() {
    confirmAction('Excluir serviço', 'Essa ação não pode ser desfeita. Confirma?', async () => {
      try {
        await deleteService(id);
        router.dismissTo('/servicos');
      } catch (error) {
        // Se o serviço já foi usado em algum orçamento/OS, o banco recusa o DELETE.
        showError('Não foi possível excluir', (error as Error).message);
      }
    });
  }

  if (!service) {
    return <ActivityIndicator size="large" style={styles.spinner} />;
  }

  return (
    <SplitScreen image={require('@/assets/images/split-servicos.jpg')}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
        <BackToListButton href="/servicos" />
        <ThemedText
          type="title"
          style={{ width: '100%', maxWidth: 440, alignSelf: 'center', textAlign: 'center', marginBottom: 8 }}>
          Editar Serviço
        </ThemedText>
        <ServiceForm
          initialValue={service}
          submitLabel="Salvar alterações"
          submitting={submitting}
          onSubmit={handleSubmit}
        />
        <Pressable style={styles.deleteButton} onPress={handleDelete}>
          <ThemedText themeColor="text">Excluir serviço</ThemedText>
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
