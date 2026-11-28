import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { ChevronRight, Fish, FlaskConical, TriangleAlert } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';

import {
  AppText,
  Button,
  Card,
  EmptyState,
  ErrorState,
  LoadingState,
  Screen,
  StatusPill,
} from '@/components/ui';
import { DashboardAquariumCard } from '@/features/dashboard/components/DashboardAquariumCard';
import { QuickActions } from '@/features/dashboard/components/QuickActions';
import { dashboardService } from '@/features/dashboard/services/dashboardService';
import { demoDataService } from '@/features/demo/services/demoDataService';
import { MaintenanceTaskRow } from '@/features/maintenance/components/MaintenanceTaskRow';
import { formatParameterValue } from '@/features/monitoring/utils/parameterStatus';
import { useFocusQuery } from '@/hooks/useFocusQuery';
import { colors, sizes, spacing } from '@/theme';
import { formatRelativeDay } from '@/utils/format';

function Stat({ label, value, tone }: { label: string; value: number; tone?: 'warning' | 'critical' }) {
  const highlighted = tone && value > 0;
  return (
    <Card style={styles.stat}>
      <AppText variant="metric" color={highlighted ? tone : 'textPrimary'}>
        {value}
      </AppText>
      <AppText variant="caption" color="textSecondary">
        {label}
      </AppText>
    </Card>
  );
}

function SectionTitle({ title, actionLabel, onAction }: { title: string; actionLabel?: string; onAction?: () => void }) {
  return (
    <View style={styles.sectionTitle}>
      <AppText variant="subtitle">{title}</AppText>
      {actionLabel && onAction ? (
        <Pressable accessibilityRole="button" onPress={onAction} hitSlop={spacing.sm} style={styles.sectionAction}>
          <AppText variant="label" color="primary">
            {actionLabel}
          </AppText>
          <ChevronRight size={sizes.iconSm} color={colors.primary} />
        </Pressable>
      ) : null}
    </View>
  );
}

export default function DashboardScreen() {
  const db = useSQLiteContext();
  const { data, loading, error, reload } = useFocusQuery(dashboardService.getSummary);
  const [loadingDemo, setLoadingDemo] = useState(false);

  async function loadDemo() {
    setLoadingDemo(true);
    try {
      await demoDataService.load(db);
      reload();
    } catch (cause) {
      console.error(cause);
      Alert.alert('Não foi possível carregar o exemplo', 'Tente novamente em instantes.');
    } finally {
      setLoadingDemo(false);
    }
  }

  function renderContent() {
    if (loading && !data) return <LoadingState />;
    if (error || !data) return <ErrorState onRetry={reload} />;

    if (data.aquariums.length === 0) {
      return (
        <EmptyState
          icon={Fish}
          title="Bem-vindo ao AquaTrack"
          description="Cadastre seu primeiro aquário para acompanhar a qualidade da água, os organismos e as manutenções."
          action={
            <View style={styles.emptyActions}>
              <Button label="Cadastrar aquário" onPress={() => router.push('/aquarium/create')} />
              <Button label="Explorar com dados de exemplo" variant="secondary" loading={loadingDemo} onPress={loadDemo} />
            </View>
          }
        />
      );
    }

    const openCount = data.overdue.length + data.upcoming.length;

    return (
      <>
        {data.hasDemoData ? (
          <Pressable accessibilityRole="button" onPress={() => router.push('/profile')}>
            <Card style={styles.demoBanner}>
              <FlaskConical size={sizes.iconSm} color={colors.primary} />
              <AppText variant="caption" style={styles.flex}>
                Você está vendo dados de exemplo. Eles podem ser removidos no Perfil.
              </AppText>
              <ChevronRight size={sizes.iconSm} color={colors.textSecondary} />
            </Card>
          </Pressable>
        ) : null}

        <View style={styles.stats}>
          <Stat label={data.aquariums.length === 1 ? 'aquário' : 'aquários'} value={data.aquariums.length} />
          <Stat label="em atenção" value={data.attention.length} tone="warning" />
          <Stat label="atrasadas" value={data.overdue.length} tone="critical" />
        </View>

        <QuickActions aquariums={data.aquariums.map(({ aquarium }) => aquarium)} />

        {data.attention.length ? (
          <>
            <SectionTitle title="Precisam de atenção" />
            <Card>
              {data.attention.map((item) => (
                <Pressable
                  key={`${item.aquariumId}-${item.parameter.id}`}
                  accessibilityRole="button"
                  onPress={() =>
                    router.push({
                      pathname: '/monitoring/history/[id]',
                      params: { id: item.aquariumId, parameter: item.parameter.id },
                    })
                  }
                  style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
                  <TriangleAlert size={sizes.iconSm} color={colors.warning} />
                  <View style={styles.flex}>
                    <AppText variant="label">
                      {item.parameter.name}:{' '}
                      {item.latest ? formatParameterValue(item.latest.value, item.parameter.decimals) : '—'}{' '}
                      {item.parameter.unit === 'pH' ? '' : item.parameter.unit}
                    </AppText>
                    <AppText variant="caption" color="textSecondary">
                      {item.aquariumName}
                      {item.latest ? ` · ${formatRelativeDay(item.latest.measuredAt)}` : ''}
                    </AppText>
                  </View>
                  <StatusPill label="Fora da faixa" tone="warning" />
                </Pressable>
              ))}
              <AppText variant="caption" color="textSecondary" style={styles.footnote}>
                Confirme com uma nova medição antes de agir.
              </AppText>
            </Card>
          </>
        ) : null}

        <SectionTitle
          title="Manutenções"
          actionLabel={openCount ? 'Ver todas' : undefined}
          onAction={() => router.push('/maintenance')}
        />
        {openCount ? (
          <Card>
            {[...data.overdue, ...data.upcoming].map((task) => (
              <MaintenanceTaskRow key={task.id} task={task} onCompleted={reload} />
            ))}
          </Card>
        ) : (
          <Card>
            <AppText color="textSecondary">Nenhuma tarefa agendada. Use “Nova tarefa” acima para criar a primeira.</AppText>
          </Card>
        )}

        <SectionTitle
          title="Últimas medições"
          actionLabel={data.recentRecords.length ? 'Monitorar' : undefined}
          onAction={() => router.push('/monitoring')}
        />
        {data.recentRecords.length ? (
          <Card>
            {data.recentRecords.map((record) => (
              <View key={record.id} style={styles.row}>
                <View style={styles.flex}>
                  <AppText variant="label">
                    {record.parameterName}: {formatParameterValue(record.value, record.decimals)}{' '}
                    {record.unit === 'pH' ? '' : record.unit}
                  </AppText>
                  <AppText variant="caption" color="textSecondary">
                    {record.aquariumName} · {formatRelativeDay(record.measuredAt)}
                  </AppText>
                </View>
              </View>
            ))}
          </Card>
        ) : (
          <Card>
            <AppText color="textSecondary">
              Nenhuma medição ainda. Use “Registrar medição” para acompanhar a evolução da água.
            </AppText>
          </Card>
        )}

        <SectionTitle title="Seus aquários" actionLabel="Ver todos" onAction={() => router.push('/aquariums')} />
        {data.aquariums.map((summary) => (
          <DashboardAquariumCard key={summary.aquarium.id} summary={summary} />
        ))}
      </>
    );
  }

  return (
    <Screen title="AquaTrack" subtitle="Visão geral dos seus aquários">
      {renderContent()}
    </Screen>
  );
}

const styles = StyleSheet.create({
  emptyActions: {
    gap: spacing.sm,
  },
  demoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.primaryMuted,
    borderColor: colors.secondary,
  },
  stats: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  stat: {
    flex: 1,
    padding: spacing.md,
    gap: spacing.xxs,
  },
  sectionTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  sectionAction: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  flex: {
    flex: 1,
    gap: spacing.xxs,
  },
  footnote: {
    marginTop: spacing.xs,
  },
  pressed: {
    opacity: 0.7,
  },
});
