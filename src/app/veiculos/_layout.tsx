import { Stack } from 'expo-router';

export default function VeiculosLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Veículos' }} />
      <Stack.Screen name="novo" options={{ title: 'Novo veículo' }} />
      <Stack.Screen name="[id]/index" options={{ title: 'Veículo' }} />
      <Stack.Screen name="[id]/editar" options={{ title: 'Editar veículo' }} />
    </Stack>
  );
}
