import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { CalendarPlus, Trash2 } from 'lucide-react-native';
import { Alert, StyleSheet } from 'react-native';

import { AppText, Button, Card, ErrorState, LoadingState, Screen } from '@/components/ui';
import { EquipmentForm } from '@/features/equipment/components/EquipmentForm';
import { useEquipmentDetails } from '@/features/equipment/hooks/useEquipment';
import { equipmentToForm, type EquipmentFormOutput } from '@/features/equipment/schemas/equipmentSchema';
import { equipmentService } from '@/features/equipment/services/equipmentService';
import { MaintenanceTaskRow } from '@/features/maintenance/components/MaintenanceTaskRow';
import { colors, sizes, spacing } from '@/theme';

/** Detalhes e edição de um equipamento, com as manutenções vinculadas. */
export default function EquipmentScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const db = useSQLiteContext();
  const { data, loading, error, reload } = useEquipmentDetails(id);

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
        <ErrorState message={error ? undefined : 'Equipamento não encontrado.'} onRetry={reload} />
      </Screen>
    );
  }

  const { equipment, tasks } = data;

  async function handleSubmit(values: EquipmentFormOutput) {
    try {
      await equipmentService.update(db, id, values);
      router.back();
    } catch (cause) {
      console.error(cause);
      Alert.alert('Não foi possível salvar', 'Tente novamente em instantes.');
    }
  }

  function confirmDelete() {
    const tasksNote = tasks.length ? ' As tarefas vinculadas continuam existindo, sem o vínculo.' : '';
    Alert.alert('Excluir equipamento?', `${equipment.name} será removido.${tasksNote}`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await equipmentService.remove(db, id);
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
      <Stack.Screen options={{ title: equipment.name }} />
      <AppText color="textSecondary">{equipment.aquariumName}</AppText>

      <AppText variant="subtitle">Manutenções</AppText>
      {tasks.length ? (
        <Card style={styles.list}>
          {tasks.map((task) => (
            <MaintenanceTaskRow key={task.id} task={task} showAquarium={false} onCompleted={reload} />
          ))}
        </Card>
      ) : (
        <AppText color="textSecondary">Nenhuma tarefa vinculada a este equipamento.</AppText>
      )}
      <Button
        label="Nova tarefa para este equipamento"
        variant="secondary"
        icon={<CalendarPlus size={sizes.iconSm} color={colors.primary} />}
        onPress={() =>
          router.push({
            pathname: '/maintenance/create/[id]',
            params: { id: equipment.aquariumId, equipment: equipment.id },
          })
        }
      />

      <AppText variant="subtitle">Dados do equipamento</AppText>
      <EquipmentForm
        key={equipment.updatedAt}
        defaultValues={equipmentToForm(equipment)}
        submitLabel="Salvar alterações"
        onSubmit={handleSubmit}
      />

      <Button
        label="Excluir equipamento"
        variant="danger"
        icon={<Trash2 size={sizes.iconSm} color={colors.critical} />}
        onPress={confirmDelete}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {
    paddingVertical: spacing.xs,
  },
});
