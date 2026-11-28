import { Bug, Fish, Flower2, Leaf, Shell, Shrimp, type LucideIcon } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, RadialGradient, Rect, Stop } from 'react-native-svg';

import { colors } from '@/theme';

import type { SpeciesCategory } from '../types/species';

const ICONS: Record<SpeciesCategory, LucideIcon> = {
  fish: Fish,
  plant: Leaf,
  coral: Flower2,
  shrimp: Shrimp,
  snail: Shell,
  other_invertebrate: Bug,
};

/** Tom de cada categoria no fundo da ilustração; todos escuros o bastante para o ícone claro. */
const TINT: Record<SpeciesCategory, string> = {
  fish: '#1B6E7E',
  plant: '#1E6B4C',
  coral: '#7A3B5E',
  shrimp: '#8A4632',
  snail: '#5B5A2E',
  other_invertebrate: '#3F4D86',
};

type SpeciesIllustrationProps = {
  category: SpeciesCategory;
  /** Lado menor da área, usado para dimensionar o ícone. */
  size: number;
};

/**
 * Placeholder quando não há foto: gradiente no tom da categoria, brilho e bolhas, com o ícone
 * da categoria em destaque. Ocupa todo o espaço do pai.
 */
export function SpeciesIllustration({ category, size }: SpeciesIllustrationProps) {
  const Icon = ICONS[category];
  const tint = TINT[category];
  const gradientId = `ill-${category}`;

  return (
    <View style={StyleSheet.absoluteFill} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Svg width="100%" height="100%">
        <Defs>
          <LinearGradient id={`${gradientId}-bg`} x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={tint} />
            <Stop offset="1" stopColor={colors.surfaceSunken} />
          </LinearGradient>
          <RadialGradient id={`${gradientId}-glow`} cx="30%" cy="25%" rx="60%" ry="60%">
            <Stop offset="0" stopColor="#FFFFFF" stopOpacity={0.18} />
            <Stop offset="1" stopColor="#FFFFFF" stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect width="100%" height="100%" fill={`url(#${gradientId}-bg)`} />
        <Rect width="100%" height="100%" fill={`url(#${gradientId}-glow)`} />
        <Circle cx="82%" cy="22%" r={size * 0.05} fill="#FFFFFF" fillOpacity={0.18} />
        <Circle cx="88%" cy="38%" r={size * 0.03} fill="#FFFFFF" fillOpacity={0.14} />
        <Circle cx="76%" cy="48%" r={size * 0.02} fill="#FFFFFF" fillOpacity={0.12} />
      </Svg>
      <View style={styles.center}>
        <Icon size={Math.round(size * 0.42)} color={colors.textPrimary} strokeWidth={1.4} opacity={0.9} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
