import { StyleSheet, Text, type TextProps } from 'react-native';

import { colors, fontFamilyFor, typography, type ColorToken, type TypographyVariant } from '@/theme';

type AppTextProps = TextProps & {
  variant?: TypographyVariant;
  color?: ColorToken;
  align?: 'left' | 'center' | 'right';
};

export function AppText({
  variant = 'body',
  color = 'textPrimary',
  align,
  style,
  ...rest
}: AppTextProps) {
  // O peso final (variante + sobrescritas em `style`) escolhe o arquivo da Manrope.
  const flat = StyleSheet.flatten([typography[variant], style]);
  return (
    <Text
      style={[
        typography[variant],
        { color: colors[color], textAlign: align },
        style,
        { fontFamily: fontFamilyFor(flat?.fontWeight), fontWeight: 'normal' },
      ]}
      {...rest}
    />
  );
}
