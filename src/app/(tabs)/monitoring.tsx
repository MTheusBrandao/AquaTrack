import { router } from 'expo-router';
import { Activity, ChartLine, Fish, Plus } from 'lucide-react-native';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import {
  AppText,
  Button,
  Card,
  EmptyState,
  ErrorState,
  LoadingState,
  Screen,
} from '@/components/ui';
import { AquariumSelector } from '@/features/aquariums/components/AquariumSelector';
import { useAquariums } from '@/features/aquariums/hooks/useAquariums';
import { ParameterCard } from '@/features/monitoring/components/ParameterCard';
import { useMonitoringOverview } from '@/features/monitoring/hooks/useMonitoring';
import { colors, sizes, spacing } from '@/theme';

export default function MonitoringScreen() {
  const aquariums = useAquariums();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const list = aquariums.data ?? [];
  const activeId = list.some((aquarium) => aquarium.id === selectedId)
    ? selectedId
    : (list[0]?.id ?? null);
  const overview = useMonitoringOverview(activeId);

  function openAddMeasurement() {
    if (activeId) router.push({ pathname: '/monitoring/add-measurement/[id]', params: { id: activeId } });
  }

  function renderContent() {
    if (aquariums.loading && !aquariums.data) return <LoadingState />;
    if (aquariums.error) return <ErrorState onRetry={aquariums.reload} />;
    if (list.length === 0) {
      return (
        <EmptyState
          icon={Fish}
          title="Cadastre um aquário primeiro"
          description="As medições são registradas por aquário, com faixas de referência do tipo de água."
          action={<Button label="Cadastrar aquário" onPress={() => router.push('/aquarium/create')} />}
        />
      );
    }
    if (overview.error) return <ErrorState onRetry={overview.reload} />;
    const data = overview.data;
    if (!data) return <LoadingState />;

    const hasMeasurements = data.parameters.some((summary) => summary.latest);
    if (!hasMeasurements) {
      return (
        <EmptyState
          icon={Activity}
          title="Nenhuma medição registrada"
          description={`Registre a primeira medição de ${data.aquarium.name} para acompanhar a evolução da água.`}
          action={<Button label="Registrar medição" onPress={openAddMeasurement} />}
        />
      );
    }

    return (
      <>
        <View style={styles.grid}>
          {data.parameters.map((summary) => (
            <ParameterCard key={summary.parameter.id} summary={summary} aquariumId={data.aquarium.id} />
          ))}
        </View>
        <Card style={styles.note}>
          <AppText variant="caption" color="textSecondary">
            As faixas são referências gerais para o tipo de água do aquário e não substituem as necessidades de cada
            espécie. Antes de agir sobre um valor fora da faixa, confirme com uma nova medição.
          </AppText>
        </Card>
        <Button
          label="Ver histórico e gráficos"
          variant="secondary"
          icon={<ChartLine size={sizes.iconSm} color={colors.primary} />}
          onPress={() =>
            router.push({ pathname: '/monitoring/history/[id]', params: { id: data.aquarium.id } })
          }
        />
      </>
    );
  }

  return (
    <Screen
      title="Monitoramento"
      subtitle="Parâmetros da água ao longo do tempo"
      headerAction={
        activeId ? (
          <Button
            label="Registrar"
            size="small"
            icon={<Plus size={sizes.iconSm} color={colors.onPrimary} />}
            onPress={openAddMeasurement}
          />
        ) : null
      }>
      <AquariumSelector aquariums={list} selectedId={activeId} onSelect={setSelectedId} />
      {renderContent()}
    </Screen>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  note: {
    padding: spacing.md,
  },
});
