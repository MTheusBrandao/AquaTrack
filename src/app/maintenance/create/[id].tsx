import { router, useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { Alert } from 'react-native';

import { ErrorState, LoadingState, Screen } from '@/components/ui';
import { MaintenanceForm } from '@/features/maintenance/components/MaintenanceForm';
import { useMaintenanceFormData } from '@/features/maintenance/hooks/useMaintenance';
import {
  emptyMaintenanceForm,
  type MaintenanceFormOutput,
} from '@/features/maintenance/schemas/maintenanceSchema';
import { maintenanceService } from '@/features/maintenance/services/maintenanceService';

/** `id` é o aquário pré-selecionado; o formulário permite trocar. */
export default function CreateMaintenanceScreen() {
  const { id: aquariumId } = useLocalSearchParams<{ id: string }>();
  const db = useSQLiteContext();
  const { data, loading, error, reload } = useMaintenanceFormData(null);

  async function handleSubmit(values: MaintenanceFormOutput) {
    try {
      await maintenanceService.create(db, values);
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
        <ErrorState onRetry={reload} />
      </Screen>
    );
  }

  return (
    <Screen>
      <MaintenanceForm
        aquariums={data.aquariums}
        defaultValues={emptyMaintenanceForm(aquariumId)}
        submitLabel="Criar tarefa"
        onSubmit={handleSubmit}
      />
    </Screen>
  );
}
