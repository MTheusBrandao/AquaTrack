import { StyleSheet, View } from 'react-native';

import { borderWidth, colors, radius, sizes, spacing, type ColorToken } from '@/theme';

import { AppText } from './AppText';

export type StatusTone = 'success' | 'warning' | 'critical' | 'neutral';

const TONE_COLOR: Record<StatusTone, ColorToken> = {
  success: 'success',
  warning: 'warning',
  critical: 'critical',
  neutral: 'textSecondary',
};

/** Indicador de status com ponto colorido + texto (a cor nunca é a única informação). */
export function StatusPill({ label, tone }: { label: string; tone: StatusTone }) {
  const color = colors[TONE_COLOR[tone]];
  return (
    <View style={[styles.pill, { borderColor: color }]}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <AppText variant="caption" color={TONE_COLOR[tone]} style={styles.text}>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.xs,
    borderWidth: borderWidth.hairline,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    backgroundColor: colors.surface,
  },
  dot: {
    width: sizes.statusDot,
    height: sizes.statusDot,
    borderRadius: radius.pill,
  },
  text: {
    fontWeight: '600',
  },
});
