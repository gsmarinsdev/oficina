import { useState } from 'react';
import { ScrollView } from 'react-native';
import { router } from 'expo-router';

import { createVehicle } from '@/data/vehiclesRepository';
import type { VehicleInput } from '@/domain/vehicle';
import { SplitScreen } from '@/components/SplitScreen';
import { ThemedText } from '@/components/themed-text';
import { VehicleForm } from '@/components/VehicleForm';
import { showError } from '@/utils/platformAlert';

export default function NovoVeiculoScreen() {
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(input: VehicleInput) {
    setSubmitting(true);
    try {
      await createVehicle(input);
      router.back();
    } catch (error) {
      // Erro mais comum aqui: placa duplicada (a coluna é UNIQUE no banco).
      showError('Não foi possível cadastrar', (error as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SplitScreen image={require('@/assets/images/elevador.jpg')}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
        <ThemedText
          type="title"
          style={{ width: '100%', maxWidth: 440, alignSelf: 'center', textAlign: 'center', marginBottom: 8 }}>
          Novo Veículo
        </ThemedText>
        <VehicleForm submitLabel="Cadastrar" submitting={submitting} onSubmit={handleSubmit} />
      </ScrollView>
    </SplitScreen>
  );
}
