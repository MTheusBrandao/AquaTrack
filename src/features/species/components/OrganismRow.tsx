import { router } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui';
import { PressableScale } from '@/components/ui/PressableScale';
import { colors, radius, sizes, spacing } from '@/theme';

import { SPECIES_CATEGORY_LABELS, type AquariumOrganism } from '../types/species';
import { OrganismPhoto } from './OrganismPhoto';

const THUMB = 56;

export function OrganismRow({ organism }: { organism: AquariumOrganism }) {
  const { species } = organism;

  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={`${species.commonName}, ${organism.quantity} unidades`}
      onPress={() => router.push({ pathname: '/aquarium/species/[id]', params: { id: organism.id } })}
      style={styles.row}>
      <OrganismPhoto imageUri={organism.imageUri} species={species} style={styles.thumb} size={THUMB} />
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
    </PressableScale>
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
  thumb: {
    width: THUMB,
    height: THUMB,
    borderRadius: radius.md,
  },
});
