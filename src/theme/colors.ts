/**
 * Paletas por função (fundo, superfície, destaque, status), nunca por valor.
 *
 * Hoje o app só tem o tema escuro "Águas profundas". Para adicionar o claro, crie `lightPalette`
 * com as mesmas chaves (o tipo `Palette` obriga) e troque a leitura estática de `colors` por um
 * hook que escolha a paleta pelo `useColorScheme()`.
 */
const darkPalette = {
  /** Fundo da tela; o topo recebe um gradiente até `backgroundTop`. */
  background: '#071620',
  backgroundTop: '#0F3447',
  /** Cartões e listas. Sólido de propósito: números sempre sobre fundo legível. */
  surface: '#0F2C3C',
  /** Campos, controles e áreas de resultado dentro de cartões. */
  surfaceRaised: '#143A4D',
  surfaceSunken: '#0A2231',
  /** Barra de abas flutuante. */
  tabBar: '#0C2433',
  primary: '#45E3CF',
  primaryMuted: 'rgba(69, 227, 207, 0.14)',
  onPrimary: '#062028',
  /** Faixa de referência do gráfico. */
  secondary: 'rgba(110, 231, 168, 0.10)',
  textPrimary: '#EAF6F8',
  textSecondary: '#8FB3BF',
  border: 'rgba(255, 255, 255, 0.10)',
  borderStrong: 'rgba(255, 255, 255, 0.18)',
  success: '#6EE7A8',
  successMuted: 'rgba(110, 231, 168, 0.14)',
  warning: '#FFC857',
  warningMuted: 'rgba(255, 200, 87, 0.14)',
  critical: '#FF6B7A',
  criticalMuted: 'rgba(255, 107, 122, 0.14)',
  shadow: '#000000',
} as const;

export type Palette = { readonly [K in keyof typeof darkPalette]: string };

export const palettes = { dark: darkPalette } satisfies Record<string, Palette>;

export const colors: Palette = palettes.dark;

export type ColorToken = keyof Palette;
