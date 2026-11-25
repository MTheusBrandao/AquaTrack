import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { CalendarPlus, ChartLine, Pencil, Plus, Sprout, Trash2 } from 'lucide-react-native';
import { Alert, Pressable, StyleSheet, View } from 'react-native';

import {
  AppText,
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorState,
  LoadingState,
  Screen,
} from '@/components/ui';
import { AquariumImage } from '@/features/aquariums/components/AquariumImage';
import { useAquariumDetails } from '@/features/aquariums/hooks/useAquariums';
import { aquariumService } from '@/features/aquariums/services/aquariumService';
import { AQUARIUM_TYPE_LABELS, type Aquarium } from '@/features/aquariums/types/aquarium';
import { OrganismRow } from '@/features/species/components/OrganismRow';
import { colors, sizes, spacing } from '@/theme';
import { formatLocalDate, formatNumber } from '@/utils/format';

function formatDimensions({ length, width, height }: Aquarium): string | null {
  if (length === null && width === null && height === null) return null;
  const part = (value: number | null) => (value === null ? '—' : formatNumber(value));
  return `${part(length)} × ${part(width)} × ${part(height)} cm`;
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoItem}>
      <AppText variant="caption" color="textSecondary">
        {label}
      </AppText>
      <AppText variant="label">{value}</AppText>
    </View>
  );
}

export default function AquariumDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const db = useSQLiteContext();
  const { data, loading, error, reload } = useAquariumDetails(id);

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

  const { aquarium, organisms } = data;
  const dimensions = formatDimensions(aquarium);

  function openAddOrganism() {
    router.push({ pathname: '/aquarium/add-species/[id]', params: { id } });
  }

  function confirmDelete() {
    const organismsNote =
      ' Organismos, medições, tarefas e histórico de manutenção deste aquário também serão excluídos.';
    Alert.alert('Excluir aquário?', `“${aquarium.name}” será removido permanentemente.${organismsNote}`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await aquariumService.remove(db, id);
            router.back();
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
      <Stack.Screen
        options={{
          title: aquarium.name,
          headerRight: () => (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Editar aquário"
              hitSlop={spacing.sm}
              onPress={() => router.push({ pathname: '/aquarium/edit/[id]', params: { id } })}>
              <Pencil size={sizes.iconMd} color={colors.primary} />
            </Pressable>
          ),
        }}
      />

      <AquariumImage uri={aquarium.imageUri} style={styles.hero} iconSize={sizes.emptyStateIcon} />

      <Card style={styles.section}>
        <View style={styles.titleRow}>
          <AppText variant="title" style={styles.flex}>
            {aquarium.name}
          </AppText>
          <Badge label={AQUARIUM_TYPE_LABELS[aquarium.type]} />
        </View>
        <View style={styles.infoGrid}>
          <InfoItem label="Volume" value={`${formatNumber(aquarium.volume)} L`} />
          {dimensions ? <InfoItem label="Dimensões (C × L × A)" value={dimensions} /> : null}
          {aquarium.targetTemperature !== null ? (
            <InfoItem label="Temperatura desejada" value={`${formatNumber(aquarium.targetTemperature)} °C`} />
          ) : null}
          {aquarium.setupDate ? (
            <InfoItem label="Montado em" value={formatLocalDate(aquarium.setupDate)} />
          ) : null}
        </View>
        {aquarium.description ? <AppText color="textSecondary">{aquarium.description}</AppText> : null}
      </Card>

      <View style={styles.shortcuts}>
        <View style={styles.flex}>
          <Button
            label="Parâmetros"
            variant="secondary"
            size="small"
            icon={<ChartLine size={sizes.iconSm} color={colors.primary} />}
            onPress={() => router.push({ pathname: '/monitoring/history/[id]', params: { id } })}
          />
        </View>
        <View style={styles.flex}>
          <Button
            label="Nova tarefa"
            variant="secondary"
            size="small"
            icon={<CalendarPlus size={sizes.iconSm} color={colors.primary} />}
            onPress={() => router.push({ pathname: '/maintenance/create/[id]', params: { id } })}
          />
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <AppText variant="subtitle">Fauna e flora</AppText>
        {organisms.length ? (
          <Button
            label="Adicionar"
            size="small"
            variant="secondary"
            icon={<Plus size={sizes.iconSm} color={colors.primary} />}
            onPress={openAddOrganism}
          />
        ) : null}
      </View>

      {organisms.length ? (
        <Card style={styles.list}>
          {organisms.map((organism) => (
            <OrganismRow key={organism.id} organism={organism} />
          ))}
        </Card>
      ) : (
        <EmptyState
          icon={Sprout}
          title="Nenhum organismo"
          description="Registre peixes, plantas, corais e invertebrados que vivem neste aquário."
          action={<Button label="Adicionar organismo" onPress={openAddOrganism} />}
        />
      )}

      <Button
        label="Excluir aquário"
        variant="danger"
        icon={<Trash2 size={sizes.iconSm} color={colors.critical} />}
        onPress={confirmDelete}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    width: '100%',
    height: sizes.heroImage,
  },
  section: {
    gap: spacing.lg,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  flex: {
    flex: 1,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: spacing.md,
  },
  infoItem: {
    width: '50%',
    gap: spacing.xxs,
  },
  shortcuts: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  list: {
    paddingVertical: spacing.sm,
  },
});
