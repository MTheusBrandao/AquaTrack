import { Platform, type TextStyle, type ViewStyle } from 'react-native';

import { colors } from './colors';

export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 999,
} as const;

export const borderWidth = {
  hairline: 1,
  thick: 2,
} as const;

export const typography = {
  display: { fontSize: 28, lineHeight: 34, fontWeight: '700' },
  title: { fontSize: 22, lineHeight: 28, fontWeight: '700' },
  subtitle: { fontSize: 17, lineHeight: 24, fontWeight: '600' },
  body: { fontSize: 15, lineHeight: 22, fontWeight: '400' },
  label: { fontSize: 14, lineHeight: 20, fontWeight: '600' },
  caption: { fontSize: 13, lineHeight: 18, fontWeight: '400' },
  tabLabel: { fontSize: 11, lineHeight: 14, fontWeight: '600' },
} as const satisfies Record<string, TextStyle>;

export type TypographyVariant = keyof typeof typography;

/** Sombras discretas: o design é baseado em bordas, a elevação só separa camadas. */
export const elevation = {
  none: {},
  low: Platform.select<ViewStyle>({
    ios: {
      shadowColor: colors.textPrimary,
      shadowOpacity: 0.06,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 2 },
    },
    default: { elevation: 1 },
  }),
} as const;

export const sizes = {
  buttonHeight: 48,
  iconSm: 18,
  iconMd: 22,
  iconLg: 32,
  emptyStateIcon: 64,
  tabBarHeight: 64,
} as const;
