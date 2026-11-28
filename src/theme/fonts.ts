import {
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
  Manrope_800ExtraBold,
} from '@expo-google-fonts/manrope';
import type { TextStyle } from 'react-native';

/** Arquivos carregados no `_layout` raiz com `useFonts`. */
export const fontAssets = {
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
  Manrope_800ExtraBold,
};

type Weight = NonNullable<TextStyle['fontWeight']>;

/**
 * Fonte customizada não escolhe o peso pelo `fontWeight` (no Android ele é ignorado e no iOS
 * pode ser sintetizado), então cada peso aponta para o arquivo próprio.
 */
export function fontFamilyFor(weight: Weight | undefined): string {
  switch (String(weight ?? '400')) {
    case '800':
    case '900':
    case 'heavy':
    case 'black':
      return 'Manrope_800ExtraBold';
    case '700':
    case 'bold':
      return 'Manrope_700Bold';
    case '600':
    case 'semibold':
      return 'Manrope_600SemiBold';
    case '500':
    case 'medium':
      return 'Manrope_500Medium';
    default:
      return 'Manrope_400Regular';
  }
}
