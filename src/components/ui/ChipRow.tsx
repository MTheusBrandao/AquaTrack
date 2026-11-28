import type { ReactNode } from 'react';
import { ScrollView, StyleSheet } from 'react-native';

import { spacing } from '@/theme';

type ChipRowProps = {
  children: ReactNode;
};

/**
 * Linha de chips com rolagem horizontal.
 *
 * O ScrollView horizontal do React Native tem `flexGrow: 1` por padrão. Dentro do conteúdo do
 * `Screen` (que também cresce para ocupar a tela), ele absorvia toda a sobra vertical e os chips
 * esticavam até virar pílulas gigantes quando a tela tinha pouco conteúdo. `flexGrow: 0` e
 * `alignItems: 'center'` mantêm a linha na altura do chip.
 */
export function ChipRow({ children }: ChipRowProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.scroll}
      contentContainerStyle={styles.row}>
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 0,
  },
  row: {
    alignItems: 'center',
    gap: spacing.sm,
  },
});
