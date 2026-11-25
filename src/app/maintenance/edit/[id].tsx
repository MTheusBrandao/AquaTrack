import { router, useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { Alert } from 'react-native';

import { ErrorState, LoadingState, Screen } from '@/components/ui';
import { MaintenanceForm } from '@/features/maintenance/components/MaintenanceForm';
import { useMaintenanceFormData } from '@/features/maintenance/hooks/useMaintenance';
import {
  maintenanceToForm,
  type MaintenanceFormOutput,
} from '@/features/maintenance/schemas/maintenanceSchema';
import { maintenanceService } from '@/features/maintenance/services/maintenanceService';

export default function EditMaintenanceScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const db = useSQLiteContext();
  const { data, loading, error, reload } = useMaintenanceFormData(id);

  async function handleSubmit(values: MaintenanceFormOutput) {
    try {
      await maintenanceService.update(db, id, values);
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

  if (error || !data?.task) {
    return (
      <Screen>
        <ErrorState message={error ? undefined : 'Tarefa não encontrada.'} onRetry={reload} />
      </Screen>
    );
  }

  return (
    <Screen>
      <MaintenanceForm
        key={data.task.id}
        aquariums={data.aquariums}
        defaultValues={maintenanceToForm(data.task)}
        submitLabel="Salvar alterações"
        onSubmit={handleSubmit}
      />
    </Screen>
  );
}
