import * as ImagePicker from 'expo-image-picker';
import { Camera, Trash2 } from 'lucide-react-native';
import { Alert, StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui';
import { colors, sizes, spacing } from '@/theme';

import { AquariumImage } from './AquariumImage';

type AquariumImagePickerProps = {
  value: string | null;
  onChange: (uri: string | null) => void;
};

export function AquariumImagePicker({ value, onChange }: AquariumImagePickerProps) {
  async function pickImage() {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.7,
      });
      if (!result.canceled && result.assets[0]) onChange(result.assets[0].uri);
    } catch {
      Alert.alert('Foto', 'Não foi possível abrir a galeria.');
    }
  }

  return (
    <View style={styles.container}>
      <AquariumImage uri={value} style={styles.preview} />
      <View style={styles.actions}>
        <View style={styles.action}>
          <Button
            label={value ? 'Trocar foto' : 'Escolher foto'}
            variant="secondary"
            size="small"
            icon={<Camera size={sizes.iconSm} color={colors.primary} />}
            onPress={pickImage}
          />
        </View>
        {value ? (
          <View style={styles.action}>
            <Button
              label="Remover"
              variant="danger"
              size="small"
              icon={<Trash2 size={sizes.iconSm} color={colors.critical} />}
              onPress={() => onChange(null)}
            />
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  preview: {
    width: '100%',
    aspectRatio: 16 / 9,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  action: {
    flex: 1,
  },
});
