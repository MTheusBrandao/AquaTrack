import { router, useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { Alert } from 'react-native';

import { AppText, ErrorState, LoadingState, Screen } from '@/components/ui';
import { AQUARIUM_TYPE_LABELS } from '@/features/aquariums/types/aquarium';
import { MeasurementForm } from '@/features/monitoring/components/MeasurementForm';
import { useApplicableParameters } from '@/features/monitoring/hooks/useMonitoring';
import type { MeasurementFormOutput } from '@/features/monitoring/schemas/measurementSchema';
import { monitoringService } from '@/features/monitoring/services/monitoringService';

export default function AddMeasurementScreen() {
  const { id: aquariumId } = useLocalSearchParams<{ id: string }>();
  const db = useSQLiteContext();
  const { data, loading, error, reload } = useApplicableParameters(aquariumId);

  async function handleSubmit(values: MeasurementFormOutput) {
    try {
      await monitoringService.addMeasurement(db, aquariumId, values);
      router.back();
    } catch (cause) {
      console.error(cause);
      Alert.alert('Não foi possível salvar', 'Tente novamente em instantes.');
    }
  }

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

  return (
    <Screen>
      <AppText color="textSecondary">
        {data.aquarium.name} · {AQUARIUM_TYPE_LABELS[data.aquarium.type]}
      </AppText>
      <MeasurementForm parameters={data.parameters} onSubmit={handleSubmit} />
    </Screen>
  );
}
