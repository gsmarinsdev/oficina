import { Stack } from 'expo-router';

export default function OrdensLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Ordens de Serviço' }} />
      <Stack.Screen name="novo" options={{ title: 'Nova OS' }} />
      <Stack.Screen name="[id]/index" options={{ title: 'Ordem de Serviço' }} />
      <Stack.Screen name="[id]/editar" options={{ title: 'Editar OS' }} />
    </Stack>
  );
}
