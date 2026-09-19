/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

// Identidade visual da oficina: grafite estrutural + fundos claros +
// laranja funcional (ver "Prompt — Identidade Visual da Oficina Mecânica").
// `primary`/`primaryPressed` = laranja/laranja-hover; `surfaceDark` = grafite,
// usado em header/footer/áreas institucionais escuras.
export const Colors = {
  light: {
    text: '#25282A',
    background: '#F7F7F5',
    backgroundElement: '#E7E9EA',
    backgroundSelected: '#F7DDC9',
    textSecondary: '#4B5359',
    primary: '#E66A1F',
    primaryPressed: '#B94C12',
    surfaceDark: '#202428',
  },
  dark: {
    text: '#F7F7F5',
    background: '#202428',
    backgroundElement: '#2B3034',
    backgroundSelected: '#4A2E1B',
    textSecondary: '#B7BBC0',
    primary: '#E66A1F',
    primaryPressed: '#F08541',
    surfaceDark: '#141618',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

// Nomes de família registrados pelo useFonts() em _layout.tsx.
// Barlow nos títulos, Inter no resto — como definido na identidade visual.
export const AppFonts = {
  headingExtraBold: 'Barlow_800ExtraBold',
  headingBold: 'Barlow_700Bold',
  headingSemiBold: 'Barlow_600SemiBold',
  body: 'Inter_400Regular',
  bodyMedium: 'Inter_500Medium',
  bodySemiBold: 'Inter_600SemiBold',
  bodyBold: 'Inter_700Bold',
} as const;

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
