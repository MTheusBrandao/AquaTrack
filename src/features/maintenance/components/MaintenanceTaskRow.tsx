import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { Check } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, View } from 'react-native';

import { AppText, StatusPill, type StatusTone } from '@/components/ui';
import { borderWidth, colors, radius, sizes, spacing } from '@/theme';
import { formatDateTime, formatRelativeDay } from '@/utils/format';

import { maintenanceService } from '../services/maintenanceService';
import { FREQUENCY_LABELS, type MaintenanceStatus, type MaintenanceTask } from '../types/maintenance';
import { getMaintenanceStatus } from '../utils/recurrence';

export const MAINTENANCE_STATUS_LABELS: Record<MaintenanceStatus, string> = {
  pending: 'Pendente',
  overdue: 'Atrasada',
  completed: 'Concluída',
};

export const MAINTENANCE_STATUS_TONE: Record<MaintenanceStatus, StatusTone> = {
  pending: 'neutral',
  overdue: 'critical',
  completed: 'success',
};

type MaintenanceTaskRowProps = {
  task: MaintenanceTask;
  showAquarium?: boolean;
  onCompleted: () => void;
};

export function MaintenanceTaskRow({ task, showAquarium = true, onCompleted }: MaintenanceTaskRowProps) {
  const db = useSQLiteContext();
  const [completing, setCompleting] = useState(false);
  const status = getMaintenanceStatus(task, new Date());

  async function handleComplete() {
    setCompleting(true);
    try {
      await maintenanceService.complete(db, task.id);
      onCompleted();
    } catch (cause) {
      console.error(cause);
      Alert.alert('Não foi possível concluir', 'Tente novamente em instantes.');
    } finally {
      setCompleting(false);
    }
  }

  function confirmComplete() {
    const message =
      task.frequency === 'once'
        ? 'A tarefa vai para o histórico.'
        : 'A conclusão vai para o histórico e a tarefa é reagendada para a próxima data.';
    Alert.alert(`Concluir “${task.title}”?`, message, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Concluir', onPress: handleComplete },
    ]);
  }

  return (
    <View style={styles.row}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Concluir ${task.title}`}
        disabled={completing}
        onPress={confirmComplete}
        hitSlop={spacing.xs}
        style={styles.check}>
        {completing ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : (
          <Check size={sizes.iconSm} color={colors.primary} />
        )}
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Abrir ${task.title}`}
        onPress={() => router.push({ pathname: '/maintenance/details/[id]', params: { id: task.id } })}
        style={({ pressed }) => [styles.info, pressed && styles.pressed]}>
        <AppText variant="label" numberOfLines={1}>
          {task.title}
        </AppText>
        <AppText variant="caption" color="textSecondary" numberOfLines={1}>
          {showAquarium ? `${task.aquariumName} · ` : ''}
          {FREQUENCY_LABELS[task.frequency]}
        </AppText>
        <AppText variant="caption" color={status === 'overdue' ? 'critical' : 'textSecondary'}>
          {formatDateTime(task.scheduledAt)} ({formatRelativeDay(task.scheduledAt)})
        </AppText>
      </Pressable>
      <StatusPill label={MAINTENANCE_STATUS_LABELS[status]} tone={MAINTENANCE_STATUS_TONE[status]} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  check: {
    width: sizes.iconBadge,
    height: sizes.iconBadge,
    borderRadius: radius.pill,
    borderWidth: borderWidth.thick,
    borderColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    gap: spacing.xxs,
  },
  pressed: {
    opacity: 0.7,
  },
});
