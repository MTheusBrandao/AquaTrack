import { Stack, useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { ChartLine, Trash2 } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { LineChart } from '@/components/charts/LineChart';
import {
  AppText,
  Card,
  Chip,
  EmptyState,
  ErrorState,
  LoadingState,
  Screen,
  StatusPill,
} from '@/components/ui';
import { STATUS_TONE } from '@/features/monitoring/components/ParameterCard';
import { useParameterHistory } from '@/features/monitoring/hooks/useMonitoring';
import {
  monitoringService,
  PERIOD_LABELS,
  PERIODS,
  type Period,
} from '@/features/monitoring/services/monitoringService';
import { PARAMETER_KEYS, type ParameterKey } from '@/features/monitoring/types/parameter';
import {
  formatParameterValue,
  formatReferenceRange,
  getParameterStatus,
  PARAMETER_STATUS_LABELS,
} from '@/features/monitoring/utils/parameterStatus';
import { colors, sizes, spacing } from '@/theme';
import { formatDateTime, formatShortDate } from '@/utils/format';

function isParameterKey(value: string | undefined): value is ParameterKey {
  return PARAMETER_KEYS.some((key) => key === value);
}

export default function ParameterHistoryScreen() {
  const params = useLocalSearchParams<{ id: string; parameter?: string }>();
  const db = useSQLiteContext();
  const [parameterId, setParameterId] = useState<ParameterKey>(
    isParameterKey(params.parameter) ? params.parameter : 'temperature',
  );
  const [period, setPeriod] = useState<Period>('30d');
  const { data, loading, error, reload } = useParameterHistory(params.id, parameterId, period);

  if (loading && data === undefined) {
    return (
      <Screen>
        <LoadingState />
      </Screen>
    );
  }

  if (error || !data) {
    return (
      <Screen>
        <ErrorState message={error ? undefined : 'Aquário não encontrado.'} onRetry={reload} />
      </Screen>
    );
  }

  // Os atalhos só abrem parâmetros aplicáveis; temperatura (padrão) se aplica a todos os tipos.
  const parameter = data.parameters.find((item) => item.id === parameterId);
  if (!parameter) {
    return (
      <Screen>
        <ErrorState message="Parâmetro não disponível para este aquário." />
      </Screen>
    );
  }

  const records = data.records;
  const format = (value: number) => formatParameterValue(value, parameter.decimals);
  const unit = parameter.unit === 'pH' ? '' : ` ${parameter.unit}`;
  const parameterName = parameter.name;

  function confirmDelete(recordId: string, label: string) {
    Alert.alert('Excluir medição?', `${parameterName}: ${label}`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await monitoringService.deleteRecord(db, recordId);
            reload();
          } catch (cause) {
            console.error(cause);
            Alert.alert('Não foi possível excluir', 'Tente novamente em instantes.');
          }
        },
      },
    ]);
  }

  return (
    <Screen>
      <Stack.Screen options={{ title: data.aquarium.name }} />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
        {data.parameters.map((item) => (
          <Chip
            key={item.id}
            label={item.name}
            selected={item.id === parameter.id}
            onPress={() => setParameterId(item.id)}
          />
        ))}
      </ScrollView>

      <View style={styles.chips}>
        {PERIODS.map((value) => (
          <Chip key={value} label={PERIOD_LABELS[value]} selected={value === period} onPress={() => setPeriod(value)} />
        ))}
      </View>

      {records.length === 0 ? (
        <EmptyState
          icon={ChartLine}
          title={`Sem medições de ${parameter.name}`}
          description={
            period === 'all'
              ? 'Registre medições para acompanhar a evolução deste parâmetro.'
              : 'Nenhuma medição neste período. Tente ampliar o filtro.'
          }
        />
      ) : (
        <>
          <Card style={styles.chartCard}>
            <View style={styles.chartHeader}>
              <AppText variant="subtitle">{parameter.name}</AppText>
              <AppText variant="caption" color="textSecondary">
                Faixa de referência: {formatReferenceRange(parameter.reference, parameter.decimals, parameter.unit)}
              </AppText>
            </View>
            <LineChart
              points={records.map((record) => ({
                x: new Date(record.measuredAt).getTime(),
                y: record.value,
                highlighted: getParameterStatus(record.value, parameter.reference) === 'out_of_range',
              }))}
              referenceMin={parameter.reference.minValue}
              referenceMax={parameter.reference.maxValue}
              formatY={format}
              formatX={(timestamp) => formatShortDate(new Date(timestamp).toISOString())}
              accessibilityLabel={`Gráfico de ${parameter.name} com ${records.length} medições`}
            />
            {records.length === 1 ? (
              <AppText variant="caption" color="textSecondary">
                Com uma única medição ainda não há tendência. Registre outras para ver a evolução.
              </AppText>
            ) : null}
          </Card>

          <AppText variant="subtitle">Medições</AppText>
          <Card style={styles.list}>
            {[...records].reverse().map((record) => {
              const status = getParameterStatus(record.value, parameter.reference);
              const label = `${format(record.value)}${unit}`;
              return (
                <View key={record.id} style={styles.row}>
                  <View style={styles.flex}>
                    <AppText variant="label">{label}</AppText>
                    <AppText variant="caption" color="textSecondary">
                      {formatDateTime(record.measuredAt)}
                    </AppText>
                    {record.notes ? (
                      <AppText variant="caption" color="textSecondary">
                        {record.notes}
                      </AppText>
                    ) : null}
                  </View>
                  <StatusPill label={PARAMETER_STATUS_LABELS[status]} tone={STATUS_TONE[status]} />
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Excluir medição de ${label}`}
                    hitSlop={spacing.sm}
                    onPress={() => confirmDelete(record.id, label)}>
                    <Trash2 size={sizes.iconSm} color={colors.textSecondary} />
                  </Pressable>
                </View>
              );
            })}
          </Card>
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chipsRow: {
    gap: spacing.sm,
  },
  chartCard: {
    gap: spacing.sm,
  },
  chartHeader: {
    gap: spacing.xxs,
  },
  list: {
    paddingVertical: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  flex: {
    flex: 1,
    gap: spacing.xxs,
  },
});
