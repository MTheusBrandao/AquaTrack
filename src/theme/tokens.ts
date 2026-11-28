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
  sm: 10,
  md: 16,
  lg: 24,
  xl: 28,
  pill: 999,
} as const;

export const borderWidth = {
  hairline: 1,
  thick: 2,
} as const;

export const typography = {
  display: { fontSize: 30, lineHeight: 36, fontWeight: '800', letterSpacing: -0.4 },
  /** Valores medidos em destaque; números tabulares para não "pularem" ao mudar. */
  metric: { fontSize: 28, lineHeight: 32, fontWeight: '700', fontVariant: ['tabular-nums'] },
  title: { fontSize: 22, lineHeight: 28, fontWeight: '800' },
  subtitle: { fontSize: 18, lineHeight: 24, fontWeight: '700' },
  body: { fontSize: 15, lineHeight: 22, fontWeight: '500' },
  label: { fontSize: 14, lineHeight: 20, fontWeight: '700' },
  caption: { fontSize: 13, lineHeight: 18, fontWeight: '500' },
  overline: { fontSize: 11, lineHeight: 14, fontWeight: '700', letterSpacing: 1.2, textTransform: 'uppercase' },
  tabLabel: { fontSize: 12, lineHeight: 16, fontWeight: '700' },
} as const satisfies Record<string, TextStyle>;

export type TypographyVariant = keyof typeof typography;

/** No escuro a separação vem das bordas; a sombra só destaca o que flutua (barra de abas, FAB). */
export const elevation = {
  none: {},
  low: {},
  floating: Platform.select<ViewStyle>({
    ios: {
      shadowColor: colors.shadow,
      shadowOpacity: 0.45,
      shadowRadius: 18,
      shadowOffset: { width: 0, height: 10 },
    },
    default: { elevation: 12 },
  }),
} as const;

export const sizes = {
  buttonHeight: 52,
  buttonHeightSmall: 36,
  inputHeight: 50,
  thumbnail: 64,
  heroImage: 200,
  iconSm: 18,
  iconMd: 22,
  iconLg: 32,
  iconBadge: 36,
  statusDot: 6,
  chartHeight: 200,
  parameterCardMinHeight: 132,
  emptyStateIcon: 64,
  tabBarHeight: 64,
  /** Espaço que telas de aba reservam no fim para a barra flutuante não cobrir conteúdo. */
  tabBarClearance: 104,
} as const;
