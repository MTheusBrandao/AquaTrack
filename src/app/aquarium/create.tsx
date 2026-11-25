import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { Alert } from 'react-native';

import { Screen } from '@/components/ui';
import { AquariumForm } from '@/features/aquariums/components/AquariumForm';
import { emptyAquariumForm, type AquariumFormOutput } from '@/features/aquariums/schemas/aquariumSchema';
import { aquariumService } from '@/features/aquariums/services/aquariumService';

export default function CreateAquariumScreen() {
  const db = useSQLiteContext();

  async function handleSubmit(values: AquariumFormOutput) {
    try {
      const id = await aquariumService.create(db, values);
      router.replace({ pathname: '/aquarium/[id]', params: { id } });
    } catch (error) {
      console.error(error);
      Alert.alert('Não foi possível salvar', 'Tente novamente em instantes.');
    }
  }

  return (
    <Screen>
      <AquariumForm defaultValues={emptyAquariumForm} submitLabel="Cadastrar aquário" onSubmit={handleSubmit} />
    </Screen>
  );
}
