import { Stack } from 'expo-router';

export default function ClientesLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Clientes' }} />
      <Stack.Screen name="novo" options={{ title: 'Novo cliente' }} />
      <Stack.Screen name="[id]/index" options={{ title: 'Cliente' }} />
      <Stack.Screen name="[id]/editar" options={{ title: 'Editar cliente' }} />
    </Stack>
  );
}
