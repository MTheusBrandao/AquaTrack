import { Image } from 'expo-image';
import { StyleSheet, View, type DimensionValue } from 'react-native';

import { resolveImageUri } from '@/features/aquariums/services/aquariumImageStorage';
import { colors, radius } from '@/theme';

import { SPECIES_PHOTOS } from '../data/speciesPhotos';
import type { SpeciesCategory } from '../types/species';
import { SpeciesIllustration } from './SpeciesIllustration';

type OrganismPhotoProps = {
  /** Foto própria do organismo (tem prioridade). */
  imageUri: string | null;
  species: { id: string; category: SpeciesCategory; commonName: string };
  style: { width?: DimensionValue; height?: DimensionValue; aspectRatio?: number; borderRadius?: number };
  /** Lado menor aproximado, para dimensionar o ícone da ilustração. */
  size: number;
};

/**
 * Ordem de prioridade: foto do usuário > foto padrão da espécie (assets/species) > ilustração.
 */
export function OrganismPhoto({ imageUri, species, style, size }: OrganismPhotoProps) {
  const source = imageUri ? { uri: resolveImageUri(imageUri) } : SPECIES_PHOTOS[species.id];

  return (
    <View
      style={[styles.frame, style]}
      accessible
      accessibilityRole="image"
      accessibilityLabel={source ? `Foto de ${species.commonName}` : `${species.commonName}, sem foto`}>
      {source ? (
        <Image source={source} style={StyleSheet.absoluteFill} contentFit="cover" transition={180} />
      ) : (
        <SpeciesIllustration category={species.category} size={size} />
      )}
    </View>
  );
}

/** Indica de onde vem a imagem mostrada, para o formulário explicar ao usuário. */
export function organismPhotoOrigin(imageUri: string | null, speciesId: string): 'own' | 'species' | 'none' {
  if (imageUri) return 'own';
  return SPECIES_PHOTOS[speciesId] ? 'species' : 'none';
}

const styles = StyleSheet.create({
  frame: {
    overflow: 'hidden',
    borderRadius: radius.md,
    backgroundColor: colors.surfaceSunken,
  },
});
