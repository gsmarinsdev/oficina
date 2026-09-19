import { Barlow_600SemiBold, Barlow_700Bold, Barlow_800ExtraBold } from '@expo-google-fonts/barlow';
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { useFonts } from 'expo-font';
import { DarkTheme, DefaultTheme, Redirect, Slot, ThemeProvider, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';

import AppTabs from '@/components/app-tabs';
import { AuthProvider, useAuth } from '@/context/auth';

SplashScreen.preventAutoHideAsync();

// Telas de autenticação abrem sozinhas, sem a navbar do app.
const PUBLIC_ROUTES = ['login', 'recuperar-senha', 'nova-senha'];

// Sem sessão, só as rotas públicas abrem; com sessão, o login leva à Home.
function AuthGate() {
  const { session, loading } = useAuth();
  const [firstSegment] = useSegments();
  const isPublicRoute = PUBLIC_ROUTES.includes(firstSegment);

  if (loading) return null;
  if (!session && !isPublicRoute) return <Redirect href="/login" />;
  if (session && firstSegment === 'login') return <Redirect href="/" />;

  return isPublicRoute ? <Slot /> : <AppTabs />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const [fontsLoaded] = useFonts({
    Barlow_600SemiBold,
    Barlow_700Bold,
    Barlow_800ExtraBold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  // Mantém a splash screen visível até a fonte carregar — evita o
  // "flash" de texto com a fonte padrão do sistema antes de trocar.
  if (!fontsLoaded) return null;
  SplashScreen.hideAsync();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AuthProvider>
        <AuthGate />
      </AuthProvider>
    </ThemeProvider>
  );
}
