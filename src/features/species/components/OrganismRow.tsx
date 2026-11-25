import { router } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui';
import { colors, sizes, spacing } from '@/theme';

import { SPECIES_CATEGORY_LABELS, type AquariumOrganism } from '../types/species';
import { SpeciesIcon } from './SpeciesIcon';

export function OrganismRow({ organism }: { organism: AquariumOrganism }) {
  const { species } = organism;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${species.commonName}, ${organism.quantity} unidades`}
      onPress={() => router.push({ pathname: '/aquarium/species/[id]', params: { id: organism.id } })}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      <SpeciesIcon category={species.category} />
      <View style={styles.info}>
        <AppText variant="label" numberOfLines={1}>
          {species.commonName}
        </AppText>
        <AppText variant="caption" color="textSecondary" numberOfLines={1}>
          {species.scientificName ? `${species.scientificName} · ` : ''}
          {SPECIES_CATEGORY_LABELS[species.category]}
        </AppText>
      </View>
      <AppText variant="label" color="primary">
        ×{organism.quantity}
      </AppText>
      <ChevronRight size={sizes.iconSm} color={colors.textSecondary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  info: {
    flex: 1,
    gap: spacing.xxs,
  },
  pressed: {
    opacity: 0.7,
  },
});
