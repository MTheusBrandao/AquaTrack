import { router, useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { Trash2 } from 'lucide-react-native';
import { Alert } from 'react-native';

import { Button, ErrorState, LoadingState, Screen } from '@/components/ui';
import { OrganismForm } from '@/features/species/components/OrganismForm';
import { SpeciesHero } from '@/features/species/components/SpeciesHero';
import { useOrganism } from '@/features/species/hooks/useOrganisms';
import { organismToForm, type OrganismFormOutput } from '@/features/species/schemas/organismSchema';
import { organismService } from '@/features/species/services/organismService';
import { colors, sizes } from '@/theme';

/** Detalhes de um organismo do aquário (registro de aquarium_species), com edição e remoção. */
export default function OrganismScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const db = useSQLiteContext();
  const { data: organism, loading, error, reload } = useOrganism(id);

  if (loading && organism === undefined) {
    return (
      <Screen>
        <LoadingState />
      </Screen>
    );
  }

  if (error || !organism) {
    return (
      <Screen>
        <ErrorState message={error ? undefined : 'Organismo não encontrado.'} onRetry={reload} />
      </Screen>
    );
  }

  const { species } = organism;

  async function handleSubmit(values: OrganismFormOutput) {
    try {
      await organismService.update(db, id, {
        quantity: values.quantity,
        addedAt: values.addedAt,
        notes: values.notes,
        imageUri: values.imageUri,
      });
      router.back();
    } catch (cause) {
      console.error(cause);
      Alert.alert('Não foi possível salvar', 'Tente novamente em instantes.');
    }
  }

  function confirmRemove() {
    Alert.alert('Remover organismo?', `${species.commonName} será removido deste aquário.`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover',
        style: 'destructive',
        onPress: async () => {
          try {
            await organismService.remove(db, id);
            router.back();
          } catch (cause) {
            console.error(cause);
            Alert.alert('Não foi possível remover', 'Tente novamente em instantes.');
          }
        },
      },
    ]);
  }

  return (
    <Screen>
      <SpeciesHero organism={organism} />

      <OrganismForm
        key={organism.id}
        defaultValues={organismToForm(organism)}
        submitLabel="Salvar alterações"
        onSubmit={handleSubmit}
        species={species}
        compactPhoto
      />

      <Button
        label="Remover do aquário"
        variant="danger"
        icon={<Trash2 size={sizes.iconSm} color={colors.critical} />}
        onPress={confirmRemove}
      />
    </Screen>
  );
}

