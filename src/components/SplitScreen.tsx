import { Image, type ImageSource } from 'expo-image';
import { StyleSheet } from 'react-native';

import { useIsMobile } from '@/hooks/use-is-mobile';
import { ThemedView } from './themed-view';

type Props = {
  image: ImageSource;
  children: React.ReactNode;
};

// Layout padrão de formulários e seletores: imagem da identidade na metade
// esquerda, conteúdo na metade direita. Fica abaixo do header da tela (o
// header é do Stack, essa view só cuida do corpo). Em tela estreita (celular)
// a imagem some e o conteúdo ocupa a largura toda.
export function SplitScreen({ image, children }: Props) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return <ThemedView style={styles.content}>{children}</ThemedView>;
  }

  return (
    <ThemedView style={styles.row}>
      <Image source={image} style={styles.image} contentFit="cover" />
      <ThemedView style={styles.content}>{children}</ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  row: {
    flex: 1,
    flexDirection: 'row',
  },
  image: {
    flex: 1,
    height: '100%',
  },
  content: {
    flex: 1,
  },
});
