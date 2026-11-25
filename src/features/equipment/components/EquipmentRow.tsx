import { router } from 'expo-router';
import {
  Cable,
  ChevronRight,
  Fan,
  Filter,
  Lightbulb,
  Thermometer,
  Waves,
  Wind,
  type LucideIcon,
} from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui';
import { colors, radius, sizes, spacing } from '@/theme';
import { formatNumber } from '@/utils/format';

import { EQUIPMENT_CATEGORY_LABELS, type Equipment, type EquipmentCategory } from '../types/equipment';

const ICONS: Record<EquipmentCategory, LucideIcon> = {
  filter: Filter,
  heater: Thermometer,
  lighting: Lightbulb,
  pump: Waves,
  skimmer: Wind,
  co2: Fan,
  other: Cable,
};

export function EquipmentRow({ equipment }: { equipment: Equipment }) {
  const Icon = ICONS[equipment.category];
  const details = [
    EQUIPMENT_CATEGORY_LABELS[equipment.category],
    [equipment.brand, equipment.model].filter(Boolean).join(' '),
    equipment.powerWatts ? `${formatNumber(equipment.powerWatts)} W` : '',
  ].filter(Boolean);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Abrir ${equipment.name}`}
      onPress={() => router.push({ pathname: '/equipment/[id]', params: { id: equipment.id } })}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      <View style={styles.icon}>
        <Icon size={sizes.iconSm} color={colors.primary} strokeWidth={1.75} />
      </View>
      <View style={styles.info}>
        <AppText variant="label" numberOfLines={1}>
          {equipment.name}
        </AppText>
        <AppText variant="caption" color="textSecondary" numberOfLines={1}>
          {details.join(' · ')}
        </AppText>
      </View>
      <ChevronRight size={sizes.iconSm} color={colors.textSecondary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  icon: {
    width: sizes.iconBadge,
    height: sizes.iconBadge,
    borderRadius: radius.pill,
    backgroundColor: colors.primaryMuted,
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
