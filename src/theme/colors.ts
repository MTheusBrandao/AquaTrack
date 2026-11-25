export const colors = {
  background: '#F2F7F6',
  surface: '#FFFFFF',
  primary: '#238D85',
  primaryMuted: '#E3F1EE',
  onPrimary: '#FFFFFF',
  secondary: '#B7DED6',
  textPrimary: '#203D43',
  textSecondary: '#71858A',
  border: '#E1EBE8',
  success: '#2E9D70',
  warning: '#E5A23B',
  critical: '#D9534F',
} as const;

export type ColorToken = keyof typeof colors;
