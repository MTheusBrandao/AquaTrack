import { router, useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { Alert } from 'react-native';

import { ErrorState, LoadingState, Screen } from '@/components/ui';
import { AquariumForm } from '@/features/aquariums/components/AquariumForm';
import { useAquarium } from '@/features/aquariums/hooks/useAquariums';
import { aquariumToForm, type AquariumFormOutput } from '@/features/aquariums/schemas/aquariumSchema';
import { aquariumService } from '@/features/aquariums/services/aquariumService';

export default function EditAquariumScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const db = useSQLiteContext();
  const { data: aquarium, loading, error, reload } = useAquarium(id);

  async function handleSubmit(values: AquariumFormOutput) {
    try {
      await aquariumService.update(db, id, values);
      router.back();
    } catch (cause) {
      console.error(cause);
      Alert.alert('Não foi possível salvar', 'Tente novamente em instantes.');
    }
  }

  if (loading && aquarium === undefined) {
    return (
      <Screen>
        <LoadingState />
      </Screen>
    );
  }

  if (error || !aquarium) {
    return (
      <Screen>
        <ErrorState message={error ? undefined : 'Aquário não encontrado.'} onRetry={reload} />
      </Screen>
    );
  }

  return (
    <Screen>
      <AquariumForm
        // A chave recria o formulário caso os dados sejam recarregados.
        key={aquarium.updatedAt}
        defaultValues={aquariumToForm(aquarium)}
        submitLabel="Salvar alterações"
        onSubmit={handleSubmit}
      />
    </Screen>
  );
}
