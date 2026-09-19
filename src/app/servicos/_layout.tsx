import { Stack } from 'expo-router';

export default function ServicosLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Serviços' }} />
      <Stack.Screen name="novo" options={{ title: 'Novo serviço' }} />
      <Stack.Screen name="[id]/index" options={{ title: 'Serviço' }} />
      <Stack.Screen name="[id]/editar" options={{ title: 'Editar serviço' }} />
    </Stack>
  );
}
