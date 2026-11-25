import { router, useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';

import { AppText, Card, ErrorState, LoadingState, Screen } from '@/components/ui';
import { AQUARIUM_TYPE_LABELS } from '@/features/aquariums/types/aquarium';
import { OrganismForm } from '@/features/species/components/OrganismForm';
import { SpeciesCatalog } from '@/features/species/components/SpeciesCatalog';
import { SpeciesIcon } from '@/features/species/components/SpeciesIcon';
import { useSpeciesCatalog } from '@/features/species/hooks/useOrganisms';
import {
  emptyOrganismForm,
  type OrganismFormOutput,
} from '@/features/species/schemas/organismSchema';
import { organismService, type SpeciesSelection } from '@/features/species/services/organismService';
import type { Species } from '@/features/species/types/species';
import { spacing } from '@/theme';

type Step =
  | { kind: 'catalog' }
  | { kind: 'selected'; species: Species }
  | { kind: 'custom'; initialName: string };

export default function AddOrganismScreen() {
  const { id: aquariumId } = useLocalSearchParams<{ id: string }>();
  const db = useSQLiteContext();
  const { data, loading, error, reload } = useSpeciesCatalog(aquariumId);
  const [step, setStep] = useState<Step>({ kind: 'catalog' });

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

  const { aquarium, catalog } = data;

  async function handleSubmit(values: OrganismFormOutput) {
    let selection: SpeciesSelection;
    if (step.kind === 'selected') {
      selection = { kind: 'catalog', speciesId: step.species.id };
    } else if (step.kind === 'custom' && values.customSpecies) {
      selection = { kind: 'custom', species: { ...values.customSpecies, waterType: aquarium.type } };
    } else {
      return;
    }

    try {
      await organismService.add(db, aquariumId, selection, {
        quantity: values.quantity,
        addedAt: values.addedAt,
        notes: values.notes,
      });
      router.back();
    } catch (cause) {
      console.error(cause);
      Alert.alert('Não foi possível salvar', 'Tente novamente em instantes.');
    }
  }

  return (
    <Screen>
      <AppText color="textSecondary">
        {aquarium.name} · {AQUARIUM_TYPE_LABELS[aquarium.type]}
      </AppText>

      {step.kind === 'catalog' ? (
        <SpeciesCatalog
          species={catalog}
          onSelect={(species) => setStep({ kind: 'selected', species })}
          onCreateCustom={(initialName) => setStep({ kind: 'custom', initialName })}
        />
      ) : (
        <>
          {step.kind === 'selected' ? (
            <Card style={styles.selected}>
              <SpeciesIcon category={step.species.category} />
              <View style={styles.flex}>
                <AppText variant="label">{step.species.commonName}</AppText>
                {step.species.scientificName ? (
                  <AppText variant="caption" color="textSecondary" style={styles.italic}>
                    {step.species.scientificName}
                  </AppText>
                ) : null}
              </View>
            </Card>
          ) : null}
          <Pressable accessibilityRole="button" onPress={() => setStep({ kind: 'catalog' })}>
            <AppText variant="label" color="primary">
              Voltar ao catálogo
            </AppText>
          </Pressable>
          <OrganismForm
            key={step.kind}
            defaultValues={emptyOrganismForm(step.kind === 'custom' ? step.initialName : undefined)}
            submitLabel="Adicionar ao aquário"
            onSubmit={handleSubmit}
          />
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  selected: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  flex: {
    flex: 1,
  },
  italic: {
    fontStyle: 'italic',
  },
});
