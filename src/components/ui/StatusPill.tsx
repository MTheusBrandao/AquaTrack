import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { colors, radius, sizes, spacing, type ColorToken } from '@/theme';

import { AppText } from './AppText';

export type StatusTone = 'success' | 'warning' | 'critical' | 'neutral';

const TONE: Record<StatusTone, { text: ColorToken; background: ColorToken }> = {
  success: { text: 'success', background: 'successMuted' },
  warning: { text: 'warning', background: 'warningMuted' },
  critical: { text: 'critical', background: 'criticalMuted' },
  neutral: { text: 'textSecondary', background: 'surfaceRaised' },
};

/** Anel que pulsa devagar atrás do ponto: só para o que pede atenção. */
function PulseRing({ color }: { color: string }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(withTiming(1, { duration: 1600, easing: Easing.out(Easing.quad) }), -1);
    return () => cancelAnimation(progress);
  }, [progress]);

  const ringStyle = useAnimatedStyle(() => ({
    opacity: 0.6 * (1 - progress.value),
    transform: [{ scale: 1 + progress.value * 1.8 }],
  }));

  return <Animated.View pointerEvents="none" style={[styles.ring, { backgroundColor: color }, ringStyle]} />;
}

/** Indicador de status com ponto colorido + texto (a cor nunca é a única informação). */
export function StatusPill({ label, tone }: { label: string; tone: StatusTone }) {
  const { text, background } = TONE[tone];
  const color = colors[text];
  const pulses = tone === 'warning' || tone === 'critical';

  return (
    <View style={[styles.pill, { backgroundColor: colors[background] }]}>
      <View style={styles.dotBox}>
        {pulses ? <PulseRing color={color} /> : null}
        <View style={[styles.dot, { backgroundColor: color }]} />
      </View>
      <AppText variant="caption" color={text} style={styles.text}>
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
    gap: spacing.xs + 2,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
  },
  dotBox: {
    width: sizes.statusDot + 1,
    height: sizes.statusDot + 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    width: sizes.statusDot + 1,
    height: sizes.statusDot + 1,
    borderRadius: radius.pill,
  },
  dot: {
    width: sizes.statusDot + 1,
    height: sizes.statusDot + 1,
    borderRadius: radius.pill,
  },
  text: {
    fontWeight: '700',
  },
});
