import * as ImagePicker from 'expo-image-picker';
import { Camera, ImagePlus, Trash2 } from 'lucide-react-native';
import { Alert, StyleSheet, View } from 'react-native';

import { AppText, Button } from '@/components/ui';
import { colors, radius, sizes, spacing } from '@/theme';

import type { SpeciesCategory } from '../types/species';
import { OrganismPhoto, organismPhotoOrigin } from './OrganismPhoto';

type OrganismPhotoPickerProps = {
  value: string | null;
  onChange: (uri: string | null) => void;
  species: { id: string; category: SpeciesCategory; commonName: string };
  /** Miniatura ao lado do texto, para telas que já mostram a foto grande no topo. */
  compact?: boolean;
};

const PICKER_OPTIONS: ImagePicker.ImagePickerOptions = {
  mediaTypes: ['images'],
  allowsEditing: true,
  aspect: [4, 3],
  quality: 0.7,
};

const ORIGIN_HINT = {
  own: 'Foto sua deste animal.',
  species: 'Foto padrão da espécie. Troque por uma sua quando quiser.',
  none: 'Sem foto: mostramos uma ilustração da categoria.',
} as const;

export function OrganismPhotoPicker({ value, onChange, species, compact }: OrganismPhotoPickerProps) {
  async function pick(fromCamera: boolean) {
    try {
      if (fromCamera) {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
          Alert.alert('Câmera', 'Permita o acesso à câmera nos Ajustes para tirar a foto.');
          return;
        }
      }
      const result = fromCamera
        ? await ImagePicker.launchCameraAsync(PICKER_OPTIONS)
        : await ImagePicker.launchImageLibraryAsync(PICKER_OPTIONS);
      if (!result.canceled && result.assets[0]) onChange(result.assets[0].uri);
    } catch {
      Alert.alert('Foto', fromCamera ? 'Não foi possível abrir a câmera.' : 'Não foi possível abrir a galeria.');
    }
  }

  return (
    <View style={styles.container}>
      {compact ? (
        <View style={styles.compactRow}>
          <OrganismPhoto imageUri={value} species={species} style={styles.thumb} size={72} />
          <AppText variant="caption" color="textSecondary" style={styles.flex}>
            {ORIGIN_HINT[organismPhotoOrigin(value, species.id)]}
          </AppText>
        </View>
      ) : (
        <>
          <OrganismPhoto imageUri={value} species={species} style={styles.preview} size={220} />
          <AppText variant="caption" color="textSecondary">
            {ORIGIN_HINT[organismPhotoOrigin(value, species.id)]}
          </AppText>
        </>
      )}
      <View style={styles.actions}>
        <View style={styles.action}>
          <Button
            label="Tirar foto"
            variant="secondary"
            size="small"
            icon={<Camera size={sizes.iconSm} color={colors.primary} />}
            onPress={() => pick(true)}
          />
        </View>
        <View style={styles.action}>
          <Button
            label="Galeria"
            variant="secondary"
            size="small"
            icon={<ImagePlus size={sizes.iconSm} color={colors.primary} />}
            onPress={() => pick(false)}
          />
        </View>
        {value ? (
          <Button
            label="Remover"
            variant="danger"
            size="small"
            icon={<Trash2 size={sizes.iconSm} color={colors.critical} />}
            onPress={() => onChange(null)}
          />
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  preview: {
    width: '100%',
    aspectRatio: 4 / 3,
    borderRadius: radius.lg,
  },
  compactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  thumb: {
    width: 72,
    height: 72,
    borderRadius: radius.md,
  },
  flex: {
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  action: {
    flex: 1,
  },
});
