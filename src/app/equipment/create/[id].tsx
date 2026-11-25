import { router, useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { Alert } from 'react-native';

import { Screen } from '@/components/ui';
import { EquipmentForm } from '@/features/equipment/components/EquipmentForm';
import { emptyEquipmentForm, type EquipmentFormOutput } from '@/features/equipment/schemas/equipmentSchema';
import { equipmentService } from '@/features/equipment/services/equipmentService';

/** `id` é o aquário onde o equipamento será cadastrado. */
export default function CreateEquipmentScreen() {
  const { id: aquariumId } = useLocalSearchParams<{ id: string }>();
  const db = useSQLiteContext();

  async function handleSubmit(values: EquipmentFormOutput) {
    try {
      await equipmentService.create(db, values);
      router.back();
    } catch (cause) {
      console.error(cause);
      Alert.alert('Não foi possível salvar', 'Tente novamente em instantes.');
    }
  }

  return (
    <Screen>
      <EquipmentForm
        defaultValues={emptyEquipmentForm(aquariumId)}
        submitLabel="Cadastrar equipamento"
        onSubmit={handleSubmit}
      />
    </Screen>
  );
}
