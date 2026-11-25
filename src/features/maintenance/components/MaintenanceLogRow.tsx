import { CircleCheck } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui';
import { colors, sizes, spacing } from '@/theme';
import { formatDateTime } from '@/utils/format';

import type { MaintenanceLog } from '../types/maintenance';

export function MaintenanceLogRow({ log, showAquarium = true }: { log: MaintenanceLog; showAquarium?: boolean }) {
  const late = new Date(log.completedAt).getTime() > new Date(log.scheduledFor).getTime();

  return (
    <View style={styles.row}>
      <CircleCheck size={sizes.iconSm} color={colors.success} />
      <View style={styles.info}>
        <AppText variant="label" numberOfLines={1}>
          {log.title}
        </AppText>
        <AppText variant="caption" color="textSecondary">
          {showAquarium ? `${log.aquariumName} · ` : ''}
          {formatDateTime(log.completedAt)}
          {late ? ' · após o prazo' : ''}
        </AppText>
      </View>
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
  info: {
    flex: 1,
    gap: spacing.xxs,
  },
});
