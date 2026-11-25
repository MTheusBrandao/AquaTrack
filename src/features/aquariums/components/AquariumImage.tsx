import { Image } from 'expo-image';
import { Fish } from 'lucide-react-native';
import { StyleSheet, View, type DimensionValue } from 'react-native';

import { colors, radius, sizes } from '@/theme';

import { resolveImageUri } from '../services/aquariumImageStorage';

type AquariumImageProps = {
  uri: string | null;
  /** Apenas dimensões: o restante da aparência é definido aqui. */
  style: { width?: DimensionValue; height?: DimensionValue; aspectRatio?: number };
  iconSize?: number;
};

/** Foto do aquário ou um placeholder neutro quando não houver foto. */
export function AquariumImage({ uri, style, iconSize = sizes.iconLg }: AquariumImageProps) {
  if (!uri) {
    return (
      <View style={[styles.placeholder, style]} accessibilityLabel="Aquário sem foto">
        <Fish size={iconSize} color={colors.primary} strokeWidth={1.5} />
      </View>
    );
  }

  return (
    <Image
      source={{ uri: resolveImageUri(uri) }}
      style={[styles.image, style]}
      contentFit="cover"
      transition={150}
      accessibilityIgnoresInvertColors
    />
  );
}

const styles = StyleSheet.create({
  placeholder: {
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
  },
  image: {
    borderRadius: radius.md,
    backgroundColor: colors.primaryMuted,
  },
});
