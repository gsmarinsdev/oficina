/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { createContext, useContext } from 'react';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

// Permite a uma tela forçar um tema (ex.: telas de login sempre escuras).
export const ThemeOverrideContext = createContext<'light' | 'dark' | null>(null);

export function useTheme() {
  const override = useContext(ThemeOverrideContext);
  const scheme = useColorScheme();
  const theme = override ?? (scheme === 'unspecified' ? 'light' : scheme);

  return Colors[theme];
}
