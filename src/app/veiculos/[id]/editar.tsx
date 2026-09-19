import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

import { getClient } from '@/data/clientsRepository';
import { deleteVehicle, getVehicle, updateVehicle } from '@/data/vehiclesRepository';
import type { Vehicle, VehicleInput } from '@/domain/vehicle';
import { BackToListButton } from '@/components/BackToListButton';
import { SplitScreen } from '@/components/SplitScreen';
import { VehicleForm } from '@/components/VehicleForm';
import { ThemedText } from '@/components/themed-text';
import { confirmAction, showError } from '@/utils/platformAlert';

export default function EditarVeiculoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [clienteNome, setClienteNome] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getVehicle(id).then((v) => {
      setVehicle(v);
      getClient(v.cliente_id).then((c) => setClienteNome(c.nome));
    });
  }, [id]);

  async function handleSubmit(input: VehicleInput) {
    setSubmitting(true);
    try {
      await updateVehicle(id, input);
      router.back();
    } catch (error) {
      showError('Não foi possível salvar', (error as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  function handleDelete() {
    confirmAction('Excluir veículo', 'Essa ação não pode ser desfeita. Confirma?', async () => {
      try {
        await deleteVehicle(id);
        router.dismissTo('/veiculos');
      } catch (error) {
        // Se o veículo tiver orçamento/OS vinculado, o banco recusa o DELETE.
        showError('Não foi possível excluir', (error as Error).message);
      }
    });
  }

  if (!vehicle || clienteNome === null) {
    return <ActivityIndicator size="large" style={styles.spinner} />;
  }

  return (
    <SplitScreen image={require('@/assets/images/elevador.jpg')}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
        <BackToListButton href="/veiculos" />
        <ThemedText
          type="title"
          style={{ width: '100%', maxWidth: 440, alignSelf: 'center', textAlign: 'center', marginBottom: 8 }}>
          Editar Veículo
        </ThemedText>
        <VehicleForm
          initialValue={{ ...vehicle, clienteNome }}
          submitLabel="Salvar alterações"
          submitting={submitting}
          onSubmit={handleSubmit}
        />
        <Pressable style={styles.deleteButton} onPress={handleDelete}>
          <ThemedText themeColor="text">Excluir veículo</ThemedText>
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
