import type { ReactNode } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { borderWidth, colors, radius, sizes, spacing, type ColorToken } from '@/theme';

import { AppText } from './AppText';
import { PressableScale } from './PressableScale';

type ButtonVariant = 'primary' | 'secondary' | 'danger';
type ButtonSize = 'regular' | 'small';

type ButtonProps = {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
  disabled?: boolean;
  loading?: boolean;
};

const textColor: Record<ButtonVariant, ColorToken> = {
  primary: 'onPrimary',
  secondary: 'primary',
  danger: 'critical',
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'regular',
  icon,
  disabled,
  loading,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      onPress={onPress}
      style={[styles.base, size === 'small' && styles.small, styles[variant], isDisabled && styles.disabled]}>
      <View style={styles.content}>
        {loading ? <ActivityIndicator size="small" color={colors[textColor[variant]]} /> : icon}
        <AppText variant="label" color={textColor[variant]} style={styles.text}>
          {label}
        </AppText>
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: sizes.buttonHeight,
    borderRadius: radius.md,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  small: {
    minHeight: sizes.buttonHeightSmall,
    paddingHorizontal: spacing.md,
  },
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.primaryMuted,
    borderWidth: borderWidth.hairline,
    borderColor: colors.primaryMuted,
  },
  danger: {
    backgroundColor: colors.criticalMuted,
    borderWidth: borderWidth.hairline,
    borderColor: colors.criticalMuted,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontSize: 15,
    fontWeight: '800',
  },
});
