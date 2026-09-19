import { Stack } from 'expo-router';

export default function OrcamentosLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Orçamentos' }} />
      <Stack.Screen name="novo" options={{ title: 'Novo orçamento' }} />
      <Stack.Screen name="[id]/index" options={{ title: 'Orçamento' }} />
      <Stack.Screen name="[id]/editar" options={{ title: 'Editar orçamento' }} />
    </Stack>
  );
}
