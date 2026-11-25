import { router } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText, Badge, Card } from '@/components/ui';
import { colors, sizes, spacing } from '@/theme';
import { formatNumber } from '@/utils/format';

import { AQUARIUM_TYPE_LABELS, type AquariumWithStats } from '../types/aquarium';
import { AquariumImage } from './AquariumImage';

function speciesLabel(count: number) {
  if (count === 0) return 'Sem organismos';
  return count === 1 ? '1 espécie' : `${count} espécies`;
}

export function AquariumCard({ aquarium }: { aquarium: AquariumWithStats }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Abrir ${aquarium.name}`}
      onPress={() => router.push({ pathname: '/aquarium/[id]', params: { id: aquarium.id } })}
      style={({ pressed }) => pressed && styles.pressed}>
      <Card style={styles.card}>
        <AquariumImage uri={aquarium.imageUri} style={styles.thumbnail} iconSize={sizes.iconMd} />
        <View style={styles.info}>
          <AppText variant="subtitle" numberOfLines={1}>
            {aquarium.name}
          </AppText>
          <Badge label={AQUARIUM_TYPE_LABELS[aquarium.type]} />
          <AppText variant="caption" color="textSecondary">
            {formatNumber(aquarium.volume)} L · {speciesLabel(aquarium.speciesCount)}
          </AppText>
        </View>
        <ChevronRight size={sizes.iconMd} color={colors.textSecondary} />
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
  },
  thumbnail: {
    width: sizes.thumbnail,
    height: sizes.thumbnail,
  },
  info: {
    flex: 1,
    gap: spacing.xs,
  },
  pressed: {
    opacity: 0.85,
  },
});
