import { Text, type TextProps } from 'react-native';

import { colors, typography, type ColorToken, type TypographyVariant } from '@/theme';

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
  return (
    <Text
      style={[typography[variant], { color: colors[color], textAlign: align }, style]}
      {...rest}
    />
  );
}
