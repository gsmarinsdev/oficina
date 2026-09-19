import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

// EXPO_PUBLIC_* fica disponível no código do app (bundle) porque o Expo
// só expõe ao client-side variáveis com esse prefixo — é a forma dele de
// deixar explícito o que é seguro embutir no app (equivalente à anon key
// ser "pública por design").
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Supabase não configurado: defina EXPO_PUBLIC_SUPABASE_URL e EXPO_PUBLIC_SUPABASE_ANON_KEY no arquivo .env'
  );
}

// No navegador a sessão fica no localStorage (persiste entre recargas) e o
// link de recuperação de senha chega no hash da URL, por isso só a web lê a URL.
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: Platform.OS === 'web',
  },
});
