import { Bug, Fish, Flower2, Leaf, Shell, Shrimp, type LucideIcon } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { colors, radius, sizes } from '@/theme';

import type { SpeciesCategory } from '../types/species';

const ICONS: Record<SpeciesCategory, LucideIcon> = {
  fish: Fish,
  plant: Leaf,
  coral: Flower2,
  shrimp: Shrimp,
  snail: Shell,
  other_invertebrate: Bug,
};

export function SpeciesIcon({ category }: { category: SpeciesCategory }) {
  const Icon = ICONS[category];
  return (
    <View style={styles.wrapper}>
      <Icon size={sizes.iconSm} color={colors.primary} strokeWidth={1.75} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: sizes.iconBadge,
    height: sizes.iconBadge,
    borderRadius: radius.pill,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
