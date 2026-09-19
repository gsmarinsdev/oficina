import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';

import { DetailView } from '@/components/DetailView';
import { getService } from '@/data/servicesRepository';
import type { Service } from '@/domain/service';

export default function ServicoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [service, setService] = useState<Service | null>(null);

  useFocusEffect(
    useCallback(() => {
      getService(id).then(setService);
    }, [id])
  );

  if (!service) {
    return <ActivityIndicator size="large" style={styles.spinner} />;
  }

  return (
    <DetailView
      image={require('@/assets/images/split-servicos.jpg')}
      title="Serviço"
      backHref="/servicos"
      fields={[
        { label: 'Nome', value: service.nome },
        { label: 'Descrição', value: service.descricao },
        { label: 'Preço base', value: `R$ ${service.preco_base.toFixed(2)}` },
        { label: 'Categoria', value: service.categoria },
        { label: 'Código da categoria', value: service.cod_categoria },
      ]}
      onEdit={() => router.push({ pathname: '/servicos/[id]/editar', params: { id } })}
    />
  );
}

const styles = StyleSheet.create({
  spinner: {
    marginTop: 48,
  },
});
