import type { LucideIcon } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { colors, radius, sizes, spacing } from '@/theme';

import { AppText } from './AppText';
import { Card } from './Card';

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  /** Ação opcional; só deve ser passada quando o fluxo de destino existir. */
  action?: ReactNode;
};

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <Card style={styles.card}>
      <View style={styles.iconWrapper}>
        <Icon size={sizes.iconLg} color={colors.primary} strokeWidth={1.75} />
      </View>
      <AppText variant="subtitle" align="center">
        {title}
      </AppText>
      <AppText color="textSecondary" align="center">
        {description}
      </AppText>
      {action ? <View style={styles.action}>{action}</View> : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.xl,
  },
  iconWrapper: {
    width: sizes.emptyStateIcon,
    height: sizes.emptyStateIcon,
    borderRadius: radius.pill,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  action: {
    marginTop: spacing.md,
    alignSelf: 'stretch',
  },
});
