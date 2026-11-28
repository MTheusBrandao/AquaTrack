import { StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { AppText } from '@/components/ui';
import { colors, radius, spacing } from '@/theme';

import { SPECIES_CATEGORY_LABELS, type AquariumOrganism } from '../types/species';
import { OrganismPhoto } from './OrganismPhoto';

/** Destaque do organismo: foto grande com nome, nome científico e quantidade sobre um degradê. */
export function SpeciesHero({ organism }: { organism: AquariumOrganism }) {
  const { species } = organism;

  return (
    <View style={styles.hero}>
      <OrganismPhoto imageUri={organism.imageUri} species={species} style={styles.photo} size={300} />
      <View style={styles.fade} pointerEvents="none">
        <Svg width="100%" height="100%">
          <Defs>
            <LinearGradient id="hero-fade" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={colors.background} stopOpacity={0} />
              <Stop offset="1" stopColor={colors.background} stopOpacity={0.92} />
            </LinearGradient>
          </Defs>
          <Rect width="100%" height="100%" fill="url(#hero-fade)" />
        </Svg>
      </View>
      <View style={styles.caption}>
        <View style={styles.titleRow}>
          <AppText variant="title" style={styles.flex} numberOfLines={2}>
            {species.commonName}
          </AppText>
          <View style={styles.quantity}>
            <AppText variant="label" color="onPrimary">
              ×{organism.quantity}
            </AppText>
          </View>
        </View>
        {species.scientificName ? (
          <AppText color="textSecondary" style={styles.italic}>
            {species.scientificName}
          </AppText>
        ) : null}
        <AppText variant="overline" color="primary">
          {SPECIES_CATEGORY_LABELS[species.category]}
          {species.isCustom ? ' · cadastrada por você' : ''}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    borderRadius: radius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  photo: {
    width: '100%',
    aspectRatio: 4 / 3,
    borderRadius: 0,
  },
  fade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '60%',
  },
  caption: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    bottom: spacing.lg,
    gap: spacing.xxs,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  flex: {
    flex: 1,
  },
  quantity: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
  },
  italic: {
    fontStyle: 'italic',
  },
});
