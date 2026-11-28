import { StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient, RadialGradient, Rect, Stop } from 'react-native-svg';

import { colors } from '@/theme';

/**
 * Fundo "Águas profundas": gradiente do topo mais claro para o abismo, com um brilho suave no
 * canto. Desenhado em SVG (react-native-svg já é dependência), sem módulo nativo novo.
 */
export function ScreenBackground() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg width="100%" height="100%">
        <Defs>
          <LinearGradient id="depth" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={colors.backgroundTop} />
            <Stop offset="0.45" stopColor={colors.background} />
            <Stop offset="1" stopColor={colors.background} />
          </LinearGradient>
          <RadialGradient id="glow" cx="90%" cy="0%" rx="70%" ry="35%">
            <Stop offset="0" stopColor={colors.primary} stopOpacity={0.12} />
            <Stop offset="1" stopColor={colors.primary} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#depth)" />
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#glow)" />
      </Svg>
    </View>
  );
}
