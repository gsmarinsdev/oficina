import type { Session } from '@supabase/supabase-js';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

import { supabase } from '@/data/supabaseClient';

type AuthValue = {
  session: Session | null;
  loading: boolean;
};

const AuthContext = createContext<AuthValue>({ session: null, loading: true });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => data.subscription.unsubscribe();
  }, []);

  return <AuthContext.Provider value={{ session, loading }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

export function translateAuthError(message: string): string {
  if (/invalid login credentials/i.test(message)) return 'Email ou senha incorretos.';
  if (/email not confirmed/i.test(message)) return 'Confirme seu email antes de entrar.';
  if (/rate limit/i.test(message)) return 'Muitas tentativas. Aguarde um pouco e tente de novo.';
  if (/session missing/i.test(message))
    return 'Link inválido ou expirado. Peça um novo em "Esqueci a senha".';
  if (/at least/i.test(message)) return 'A senha é muito curta.';
  return message;
}
