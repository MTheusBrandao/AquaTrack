import { router } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText, Badge, Card, StatusPill } from '@/components/ui';
import { AquariumImage } from '@/features/aquariums/components/AquariumImage';
import { AQUARIUM_TYPE_LABELS } from '@/features/aquariums/types/aquarium';
import { colors, sizes, spacing } from '@/theme';
import { formatNumber, formatRelativeDay } from '@/utils/format';

import type { AquariumSummary } from '../services/dashboardService';

export function DashboardAquariumCard({ summary }: { summary: AquariumSummary }) {
  const { aquarium, lastMeasuredAt, attentionCount, overdueCount } = summary;
  const allClear = attentionCount === 0 && overdueCount === 0 && lastMeasuredAt !== null;

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
          <View style={styles.badges}>
            <Badge label={AQUARIUM_TYPE_LABELS[aquarium.type]} />
            {aquarium.isDemo ? <Badge label="Exemplo" /> : null}
          </View>
          <AppText variant="caption" color="textSecondary">
            {formatNumber(aquarium.volume)} L ·{' '}
            {lastMeasuredAt ? `medido ${formatRelativeDay(lastMeasuredAt)}` : 'sem medições'}
          </AppText>
          <View style={styles.badges}>
            {attentionCount > 0 ? (
              <StatusPill
                label={attentionCount === 1 ? '1 parâmetro em atenção' : `${attentionCount} parâmetros em atenção`}
                tone="warning"
              />
            ) : null}
            {overdueCount > 0 ? (
              <StatusPill
                label={overdueCount === 1 ? '1 tarefa atrasada' : `${overdueCount} tarefas atrasadas`}
                tone="critical"
              />
            ) : null}
            {allClear ? <StatusPill label="Tudo em dia" tone="success" /> : null}
          </View>
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
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  pressed: {
    opacity: 0.85,
  },
});
