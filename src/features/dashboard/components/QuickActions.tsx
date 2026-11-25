import { router, type Href } from 'expo-router';
import { Activity, CalendarPlus, Fish, Sprout, type LucideIcon } from 'lucide-react-native';
import { Alert, Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui';
import { borderWidth, colors, radius, sizes, spacing } from '@/theme';

type AquariumOption = { id: string; name: string };

/** Ações que precisam de um aquário: com mais de um, o usuário escolhe qual. */
function withAquarium(aquariums: AquariumOption[], title: string, open: (id: string) => void) {
  if (aquariums.length === 1) {
    open(aquariums[0].id);
    return;
  }
  Alert.alert(title, 'Escolha o aquário', [
    ...aquariums.map((aquarium) => ({ text: aquarium.name, onPress: () => open(aquarium.id) })),
    { text: 'Cancelar', style: 'cancel' as const },
  ]);
}

function Action({ icon: Icon, label, onPress }: { icon: LucideIcon; label: string; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [styles.action, pressed && styles.pressed]}>
      <View style={styles.icon}>
        <Icon size={sizes.iconMd} color={colors.primary} strokeWidth={1.75} />
      </View>
      <AppText variant="caption" align="center" style={styles.label}>
        {label}
      </AppText>
    </Pressable>
  );
}

export function QuickActions({ aquariums }: { aquariums: AquariumOption[] }) {
  const go = (href: Href) => router.push(href);

  return (
    <View style={styles.row}>
      <Action icon={Fish} label="Novo aquário" onPress={() => go('/aquarium/create')} />
      <Action
        icon={Activity}
        label="Registrar medição"
        onPress={() =>
          withAquarium(aquariums, 'Registrar medição', (id) =>
            go({ pathname: '/monitoring/add-measurement/[id]', params: { id } }),
          )
        }
      />
      <Action
        icon={CalendarPlus}
        label="Nova tarefa"
        onPress={() =>
          withAquarium(aquariums, 'Nova tarefa', (id) =>
            go({ pathname: '/maintenance/create/[id]', params: { id } }),
          )
        }
      />
      <Action
        icon={Sprout}
        label="Adicionar organismo"
        onPress={() =>
          withAquarium(aquariums, 'Adicionar organismo', (id) =>
            go({ pathname: '/aquarium/add-species/[id]', params: { id } }),
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  action: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xs,
    borderRadius: radius.lg,
    borderWidth: borderWidth.hairline,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  icon: {
    width: sizes.iconBadge,
    height: sizes.iconBadge,
    borderRadius: radius.pill,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.85,
  },
});
