import { router } from 'expo-router';
import { ArrowDownRight, ArrowRight, ArrowUpRight } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText, Card, StatusPill, type StatusTone } from '@/components/ui';
import { colors, sizes, spacing } from '@/theme';
import { formatRelativeDay } from '@/utils/format';

import type { ParameterSummary } from '../services/monitoringService';
import type { ParameterStatus } from '../types/parameter';
import { formatParameterValue, PARAMETER_STATUS_LABELS } from '../utils/parameterStatus';

export const STATUS_TONE: Record<ParameterStatus, StatusTone> = {
  in_range: 'success',
  out_of_range: 'warning',
  no_reference: 'neutral',
};

function TrendIcon({ latest, previous }: { latest: number; previous: number }) {
  const props = { size: sizes.iconSm, color: colors.textSecondary };
  if (latest > previous) return <ArrowUpRight {...props} />;
  if (latest < previous) return <ArrowDownRight {...props} />;
  return <ArrowRight {...props} />;
}

type ParameterCardProps = {
  summary: ParameterSummary;
  aquariumId: string;
};

export function ParameterCard({ summary, aquariumId }: ParameterCardProps) {
  const { parameter, latest, previous, status } = summary;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Histórico de ${parameter.name}`}
      onPress={() =>
        router.push({
          pathname: '/monitoring/history/[id]',
          params: { id: aquariumId, parameter: parameter.id },
        })
      }
      style={({ pressed }) => [styles.pressable, pressed && styles.pressed]}>
      <Card style={styles.card}>
        <AppText variant="caption" color="textSecondary">
          {parameter.name}
        </AppText>
        {latest ? (
          <>
            <View style={styles.valueRow}>
              <AppText variant="title">{formatParameterValue(latest.value, parameter.decimals)}</AppText>
              <AppText variant="caption" color="textSecondary">
                {parameter.unit === 'pH' ? '' : parameter.unit}
              </AppText>
              {previous ? <TrendIcon latest={latest.value} previous={previous.value} /> : null}
            </View>
            {status ? <StatusPill label={PARAMETER_STATUS_LABELS[status]} tone={STATUS_TONE[status]} /> : null}
            <AppText variant="caption" color="textSecondary">
              {formatRelativeDay(latest.measuredAt)}
            </AppText>
          </>
        ) : (
          <>
            {/* Sem registro é diferente de zero: mostramos explicitamente "não medido". */}
            <AppText variant="title" color="textSecondary">
              —
            </AppText>
            <AppText variant="caption" color="textSecondary">
              Não medido
            </AppText>
          </>
        )}
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    width: '48%',
    flexGrow: 1,
  },
  pressed: {
    opacity: 0.85,
  },
  card: {
    gap: spacing.xs,
    padding: spacing.md,
    minHeight: sizes.parameterCardMinHeight,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.xs,
  },
});
