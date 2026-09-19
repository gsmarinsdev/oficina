import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';

import { DetailView } from '@/components/DetailView';
import { getClient } from '@/data/clientsRepository';
import { getVehicle } from '@/data/vehiclesRepository';
import type { Vehicle } from '@/domain/vehicle';

export default function VeiculoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [clienteNome, setClienteNome] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      getVehicle(id).then((v) => {
        setVehicle(v);
        getClient(v.cliente_id).then((c) => setClienteNome(c.nome));
      });
    }, [id])
  );

  if (!vehicle || clienteNome === null) {
    return <ActivityIndicator size="large" style={styles.spinner} />;
  }

  return (
    <DetailView
      image={require('@/assets/images/elevador.jpg')}
      title="Veículo"
      backHref="/veiculos"
      fields={[
        { label: 'Placa', value: vehicle.placa },
        { label: 'Marca', value: vehicle.marca },
        { label: 'Modelo', value: vehicle.modelo },
        { label: 'Ano', value: vehicle.ano ? String(vehicle.ano) : null },
        { label: 'Cor', value: vehicle.cor },
        { label: 'Cliente', value: clienteNome },
      ]}
      onEdit={() => router.push({ pathname: '/veiculos/[id]/editar', params: { id } })}
    />
  );
}

const styles = StyleSheet.create({
  spinner: {
    marginTop: 48,
  },
});
