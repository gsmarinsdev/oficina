import { Image } from 'expo-image';
import type { ReactNode } from 'react';
import { ScrollView, StyleSheet } from 'react-native';

import { ThemeOverrideContext } from '@/hooks/use-theme';
import { SplitScreen } from './SplitScreen';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

export function AuthCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <ThemeOverrideContext.Provider value="dark">
      <SplitScreen image={require('@/assets/images/split-servicos.jpg')}>
        <ThemedView style={styles.screen}>
          <ScrollView contentContainerStyle={styles.scroll}>
            <ThemedView style={styles.card}>
              <Image
                source={require('@/assets/images/logo-navbar.png')}
                style={styles.logo}
                contentFit="contain"
              />
              <ThemedText type="subtitle" style={styles.title}>
                {title}
              </ThemedText>
              {children}
            </ThemedView>
          </ScrollView>
        </ThemedView>
      </SplitScreen>
    </ThemeOverrideContext.Provider>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
    gap: 8,
  },
  logo: {
    width: 104,
    height: 94,
    alignSelf: 'center',
    marginBottom: 8,
  },
  title: {
    textAlign: 'center',
    fontSize: 28,
    lineHeight: 36,
    marginBottom: 12,
  },
});
