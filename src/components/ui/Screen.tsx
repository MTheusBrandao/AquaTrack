import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, spacing } from '@/theme';

import { AppText } from './AppText';

type ScreenProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

/** Estrutura padrão das telas de aba: cabeçalho grande + conteúdo rolável. */
export function Screen({ title, subtitle, children }: ScreenProps) {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <AppText variant="display" accessibilityRole="header">
            {title}
          </AppText>
          {subtitle ? <AppText color="textSecondary">{subtitle}</AppText> : null}
        </View>
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
    paddingBottom: spacing.xxl,
    gap: spacing.lg,
  },
  header: {
    gap: spacing.xs,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
});
