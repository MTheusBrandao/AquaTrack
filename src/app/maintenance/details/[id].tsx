import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { Bell, BellOff, Check, Pencil, Trash2 } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';

import {
  AppText,
  Badge,
  Button,
  Card,
  ErrorState,
  LoadingState,
  Screen,
  StatusPill,
} from '@/components/ui';
import { MaintenanceLogRow } from '@/features/maintenance/components/MaintenanceLogRow';
import {
  MAINTENANCE_STATUS_LABELS,
  MAINTENANCE_STATUS_TONE,
} from '@/features/maintenance/components/MaintenanceTaskRow';
import { useMaintenanceDetails } from '@/features/maintenance/hooks/useMaintenance';
import { maintenanceService } from '@/features/maintenance/services/maintenanceService';
import { FREQUENCY_LABELS, MAINTENANCE_CATEGORY_LABELS } from '@/features/maintenance/types/maintenance';
import { getMaintenanceStatus } from '@/features/maintenance/utils/recurrence';
import { colors, sizes, spacing } from '@/theme';
import { formatDateTime, formatRelativeDay } from '@/utils/format';

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <AppText color="textSecondary">{label}</AppText>
      <AppText variant="label" style={styles.infoValue}>
        {value}
      </AppText>
    </View>
  );
}

export default function MaintenanceDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const db = useSQLiteContext();
  const { data, loading, error, reload } = useMaintenanceDetails(id);
  const [completing, setCompleting] = useState(false);

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
        <ErrorState message={error ? undefined : 'Tarefa não encontrada.'} onRetry={reload} />
      </Screen>
    );
  }

  const { task, logs } = data;
  const status = getMaintenanceStatus(task, new Date());

  async function handleComplete() {
    setCompleting(true);
    try {
      await maintenanceService.complete(db, id);
      reload();
    } catch (cause) {
      console.error(cause);
      Alert.alert('Não foi possível concluir', 'Tente novamente em instantes.');
    } finally {
      setCompleting(false);
    }
  }

  function confirmDelete() {
    Alert.alert(
      'Excluir tarefa?',
      'A tarefa e o lembrete serão removidos. As conclusões já registradas continuam no histórico.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await maintenanceService.remove(db, id);
              router.back();
            } catch (cause) {
              console.error(cause);
              Alert.alert('Não foi possível excluir', 'Tente novamente em instantes.');
            }
          },
        },
      ],
    );
  }

  return (
    <Screen>
      <Stack.Screen
        options={{
          title: 'Tarefa',
          headerRight: () => (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Editar tarefa"
              hitSlop={spacing.sm}
              onPress={() => router.push({ pathname: '/maintenance/edit/[id]', params: { id } })}>
              <Pencil size={sizes.iconMd} color={colors.primary} />
            </Pressable>
          ),
        }}
      />

      <Card style={styles.section}>
        <View style={styles.titleRow}>
          <AppText variant="title" style={styles.flex}>
            {task.title}
          </AppText>
          <StatusPill label={MAINTENANCE_STATUS_LABELS[status]} tone={MAINTENANCE_STATUS_TONE[status]} />
        </View>
        <Badge label={MAINTENANCE_CATEGORY_LABELS[task.category]} />
        <View style={styles.info}>
          <InfoRow label="Aquário" value={task.aquariumName} />
          {task.equipmentName ? <InfoRow label="Equipamento" value={task.equipmentName} /> : null}
          <InfoRow label="Repetição" value={FREQUENCY_LABELS[task.frequency]} />
          {task.completedAt ? (
            <InfoRow label="Concluída em" value={formatDateTime(task.completedAt)} />
          ) : (
            <InfoRow
              label="Próxima execução"
              value={`${formatDateTime(task.scheduledAt)} (${formatRelativeDay(task.scheduledAt)})`}
            />
          )}
        </View>
        <View style={styles.reminder}>
          {task.notificationId ? (
            <Bell size={sizes.iconSm} color={colors.primary} />
          ) : (
            <BellOff size={sizes.iconSm} color={colors.textSecondary} />
          )}
          <AppText variant="caption" color="textSecondary">
            {task.notificationId
              ? 'Lembrete agendado para a próxima execução.'
              : task.reminderEnabled && !task.completedAt
                ? 'Lembrete não agendado (horário já passou ou notificações desativadas).'
                : 'Sem lembrete.'}
          </AppText>
        </View>
        {task.description ? <AppText color="textSecondary">{task.description}</AppText> : null}
      </Card>

      {!task.completedAt ? (
        <Button
          label={task.frequency === 'once' ? 'Marcar como concluída' : 'Concluir e reagendar'}
          loading={completing}
          icon={<Check size={sizes.iconSm} color={colors.onPrimary} />}
          onPress={handleComplete}
        />
      ) : null}

      <AppText variant="subtitle">Histórico</AppText>
      {logs.length ? (
        <Card>
          {logs.map((log) => (
            <MaintenanceLogRow key={log.id} log={log} showAquarium={false} />
          ))}
        </Card>
      ) : (
        <AppText color="textSecondary">Esta tarefa ainda não foi concluída nenhuma vez.</AppText>
      )}

      <Button
        label="Excluir tarefa"
        variant="danger"
        icon={<Trash2 size={sizes.iconSm} color={colors.critical} />}
        onPress={confirmDelete}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  flex: {
    flex: 1,
  },
  info: {
    gap: spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  infoValue: {
    flexShrink: 1,
    textAlign: 'right',
  },
  reminder: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
});
