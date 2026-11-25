import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, spacing } from '@/theme';

import { AppText } from './AppText';

type ScreenProps = {
  /** Título grande, usado nas abas. Telas de pilha usam o título do cabeçalho nativo. */
  title?: string;
  subtitle?: string;
  headerAction?: ReactNode;
  children: ReactNode;
};

export function Screen({ title, subtitle, headerAction, children }: ScreenProps) {
  // Com título próprio a tela é uma aba (sem cabeçalho nativo), então precisa da área segura do topo.
  const edges = title ? (['top', 'left', 'right'] as const) : (['left', 'right'] as const);

  return (
    <SafeAreaView style={styles.safeArea} edges={edges}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets>
        {title ? (
          <View style={styles.header}>
            <View style={styles.headerText}>
              <AppText variant="display" accessibilityRole="header">
                {title}
              </AppText>
              {subtitle ? <AppText color="textSecondary">{subtitle}</AppText> : null}
            </View>
            {headerAction}
          </View>
        ) : null}
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flexGrow: 1,
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
    gap: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  headerText: {
    flex: 1,
    gap: spacing.xs,
  },
});
