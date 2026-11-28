import { Stack } from 'expo-router';
import { Children, Fragment, isValidElement, type ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, sizes, spacing } from '@/theme';

import { AppText } from './AppText';
import { ScreenBackground } from './ScreenBackground';

type ScreenProps = {
  /** Título grande, usado nas abas. Telas de pilha usam o título do cabeçalho nativo. */
  title?: string;
  subtitle?: string;
  headerAction?: ReactNode;
  children: ReactNode;
};

const STAGGER_MS = 45;
const MAX_STAGGERED = 8;

/** Abre fragmentos para que cada seção da tela seja um item da coluna (e anime sozinha). */
function flattenChildren(children: ReactNode): ReactNode[] {
  return Children.toArray(children).flatMap((child) =>
    isValidElement<{ children?: ReactNode }>(child) && child.type === Fragment
      ? flattenChildren(child.props.children)
      : [child],
  );
}

function sectionType(child: ReactNode): string {
  if (!isValidElement(child)) return typeof child;
  const { type } = child;
  if (typeof type === 'string') return type;
  return (type as { displayName?: string; name?: string }).displayName ?? (type as { name?: string }).name ?? 'c';
}

export function Screen({ title, subtitle, headerAction, children }: ScreenProps) {
  // Com título próprio a tela é uma aba (sem cabeçalho nativo), então precisa da área segura do topo
  // e de espaço no fim para a barra de abas flutuante.
  const isTab = Boolean(title);
  const edges = isTab ? (['top', 'left', 'right'] as const) : (['left', 'right', 'bottom'] as const);

  const items = flattenChildren(children);
  // `<Stack.Screen>` só configura o cabeçalho e não desenha nada: fica fora da animação (e do `gap`).
  const config = items.filter((child) => isValidElement(child) && child.type === Stack.Screen);
  const visible = items.filter((child) => !(isValidElement(child) && child.type === Stack.Screen));

  const sections = visible.map((child, index) => (
    <Animated.View
      // O tipo entra na chave: quando o "carregando" vira conteúdo, a seção remonta e anima.
      key={`${index}-${sectionType(child)}`}
      entering={FadeInDown.duration(380).delay(Math.min(index, MAX_STAGGERED) * STAGGER_MS)}>
      {child}
    </Animated.View>
  ));

  return (
    <View style={styles.root}>
      <ScreenBackground />
      <SafeAreaView style={styles.safeArea} edges={edges}>
        {config}
        <ScrollView
          contentContainerStyle={[styles.content, isTab && styles.tabContent]}
          keyboardShouldPersistTaps="handled"
          automaticallyAdjustKeyboardInsets>
          {title ? (
            <Animated.View entering={FadeInDown.duration(380)} style={styles.header}>
              <View style={styles.headerText}>
                <AppText variant="display" accessibilityRole="header">
                  {title}
                </AppText>
                {subtitle ? <AppText color="textSecondary">{subtitle}</AppText> : null}
              </View>
              {headerAction}
            </Animated.View>
          ) : null}
          {sections}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
    gap: spacing.lg,
  },
  tabContent: {
    paddingTop: spacing.sm,
    paddingBottom: sizes.tabBarClearance + spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  headerText: {
    flex: 1,
    gap: spacing.xs,
  },
});
