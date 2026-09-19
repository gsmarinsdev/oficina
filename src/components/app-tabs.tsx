import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { TabList, Tabs, TabSlot, TabTrigger, type TabTriggerSlotProps } from 'expo-router/ui';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { supabase } from '@/data/supabaseClient';
import { useIsMobile } from '@/hooks/use-is-mobile';
import { ThemedText } from './themed-text';

// Navbar fixa no topo (logo + menu) — substitui a barra de abas de baixo
// que o template original trazia. `TabList` precisa ser filho direto de
// `Tabs` (é assim que ele reconhece as rotas), então a logo entra como
// mais um filho dela, não como um wrapper por fora. Pelo mesmo motivo, no
// celular o menu é recolhido só por estilo (display: none), e os
// `TabTrigger`s continuam filhos diretos do `TabList`.
export default function AppTabs() {
  const isMobile = useIsMobile();
  const [menuOpen, setMenuOpen] = useState(false);

  const itemProps = {
    collapsed: isMobile && !menuOpen,
    stacked: isMobile && menuOpen,
    onSelect: () => setMenuOpen(false),
  };

  return (
    <Tabs>
      <TabList style={[styles.navbar, isMobile && styles.navbarMobile]}>
        <Image
          source={require('@/assets/images/logo-navbar.png')}
          style={isMobile ? styles.logoMobile : styles.logo}
          contentFit="contain"
        />
        <View style={styles.spacer} />
        {isMobile && (
          <Pressable
            onPress={() => setMenuOpen((open) => !open)}
            accessibilityRole="button"
            accessibilityLabel={menuOpen ? 'Fechar menu' : 'Abrir menu'}
            style={styles.menuButton}>
            <Ionicons name={menuOpen ? 'close' : 'menu'} size={30} color="#F7F7F5" />
          </Pressable>
        )}
        <TabTrigger name="home" href="/" asChild>
          <TabButton {...itemProps}>Home</TabButton>
        </TabTrigger>
        <TabTrigger name="clientes" href="/clientes" asChild>
          <TabButton {...itemProps}>Clientes</TabButton>
        </TabTrigger>
        <TabTrigger name="veiculos" href="/veiculos" asChild>
          <TabButton {...itemProps}>Veículos</TabButton>
        </TabTrigger>
        <TabTrigger name="servicos" href="/servicos" asChild>
          <TabButton {...itemProps}>Serviços</TabButton>
        </TabTrigger>
        <TabTrigger name="orcamentos" href="/orcamentos" asChild>
          <TabButton {...itemProps}>Orçamentos</TabButton>
        </TabTrigger>
        <TabTrigger name="ordens" href="/ordens" asChild>
          <TabButton {...itemProps}>OS</TabButton>
        </TabTrigger>
        <TabTrigger name="relatorios" href="/relatorios" asChild>
          <TabButton {...itemProps}>Relatórios</TabButton>
        </TabTrigger>
        <Pressable
          style={[
            styles.tabButton,
            itemProps.stacked && styles.tabButtonStacked,
            itemProps.collapsed && styles.hidden,
          ]}
          onPress={() => supabase.auth.signOut()}>
          {({ hovered }: { hovered?: boolean }) => (
            <ThemedText type="small" style={[styles.tabLabel, hovered && styles.tabLabelHover]}>
              Sair
            </ThemedText>
          )}
        </Pressable>
      </TabList>
      <TabSlot style={{ flex: 1 }} />
    </Tabs>
  );
}

type TabButtonProps = TabTriggerSlotProps & {
  collapsed?: boolean;
  stacked?: boolean;
  onSelect?: () => void;
};

function TabButton({ children, isFocused, collapsed, stacked, onSelect, onPress, ...props }: TabButtonProps) {
  return (
    <Pressable
      {...props}
      onPress={(event) => {
        onPress?.(event);
        onSelect?.();
      }}
      style={[styles.tabButton, stacked && styles.tabButtonStacked, collapsed && styles.hidden]}>
      {({ hovered }: { hovered?: boolean }) => (
        <ThemedText
          type={isFocused ? 'smallBold' : 'small'}
          style={[styles.tabLabel, isFocused && styles.tabLabelActive, hovered && !isFocused && styles.tabLabelHover]}>
          {children}
        </ThemedText>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
    backgroundColor: '#202428',
    paddingHorizontal: 20,
    paddingVertical: 10,
    gap: 24,
  },
  navbarMobile: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    gap: 0,
  },
  spacer: {
    flexGrow: 1,
  },
  logo: {
    width: 104,
    height: 94,
  },
  logoMobile: {
    width: 64,
    height: 58,
  },
  menuButton: {
    padding: 8,
  },
  tabButton: {
    paddingVertical: 8,
  },
  tabButtonStacked: {
    width: '100%',
    paddingVertical: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#3D4449',
  },
  hidden: {
    display: 'none',
  },
  tabLabel: {
    color: '#B7BBC0',
  },
  tabLabelActive: {
    color: '#E66A1F',
  },
  tabLabelHover: {
    color: '#FFFFFF',
  },
});
