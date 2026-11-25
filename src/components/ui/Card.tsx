import { StyleSheet, View, type ViewProps } from 'react-native';

import { borderWidth, colors, elevation, radius, spacing } from '@/theme';

export function Card({ style, ...rest }: ViewProps) {
  return <View style={[styles.card, style]} {...rest} />;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: borderWidth.hairline,
    borderColor: colors.border,
    padding: spacing.lg,
    ...elevation.low,
  },
});
