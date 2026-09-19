import { useWindowDimensions } from 'react-native';

// Abaixo disso o layout de duas metades (imagem + conteúdo) deixa o conteúdo apertado.
export const MOBILE_BREAKPOINT = 768;

export function useIsMobile(): boolean {
  const { width } = useWindowDimensions();
  return width < MOBILE_BREAKPOINT;
}
