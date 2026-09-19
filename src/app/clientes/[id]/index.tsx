import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';

import { DetailView, formatDateBR } from '@/components/DetailView';
import { getClient } from '@/data/clientsRepository';
import type { Client } from '@/domain/client';

export default function ClienteScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [client, setClient] = useState<Client | null>(null);

  // Recarrega ao voltar da edição, para mostrar os dados atualizados.
  useFocusEffect(
    useCallback(() => {
      getClient(id).then(setClient);
    }, [id])
  );

  if (!client) {
    return <ActivityIndicator size="large" style={styles.spinner} />;
  }

  return (
    <DetailView
      image={require('@/assets/images/split-clientes.jpg')}
      title="Cliente"
      backHref="/clientes"
      fields={[
        { label: 'Nome', value: client.nome },
        { label: 'Telefone', value: client.telefone },
        { label: 'Email', value: client.email },
        { label: 'CPF', value: client.cpf },
        { label: 'Endereço', value: client.endereco },
        { label: 'Cadastrado em', value: formatDateBR(client.criado_em.slice(0, 10)) },
      ]}
      onEdit={() => router.push({ pathname: '/clientes/[id]/editar', params: { id } })}
    />
  );
}

const styles = StyleSheet.create({
  spinner: {
    marginTop: 48,
  },
});
