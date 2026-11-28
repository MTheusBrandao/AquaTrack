import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';

import { DateField, Field, FormTextField } from '@/components/forms';
import { AppText, Button, Card, Chip } from '@/components/ui';
import { spacing } from '@/theme';

import {
  organismSchema,
  type OrganismFormOutput,
  type OrganismFormValues,
} from '../schemas/organismSchema';
import { SPECIES_CATEGORIES, SPECIES_CATEGORY_LABELS, type SpeciesCategory } from '../types/species';
import { OrganismPhotoPicker } from './OrganismPhotoPicker';

type OrganismFormProps = {
  defaultValues: OrganismFormValues;
  submitLabel: string;
  onSubmit: (values: OrganismFormOutput) => Promise<void>;
  /** Espécie do catálogo; null quando o usuário está cadastrando uma espécie nova. */
  species: { id: string; category: SpeciesCategory; commonName: string } | null;
  /** Foto em miniatura no formulário (a tela já mostra a foto grande). */
  compactPhoto?: boolean;
};

export function OrganismForm({ defaultValues, submitLabel, onSubmit, species, compactPhoto }: OrganismFormProps) {
  const { control, handleSubmit, formState } = useForm<OrganismFormValues, unknown, OrganismFormOutput>({
    resolver: zodResolver(organismSchema),
    defaultValues,
  });
  const isCustom = defaultValues.customSpecies !== null;
  const customSpecies = useWatch({ control, name: 'customSpecies' });
  // Espécie nova ainda não tem id nem foto padrão: a prévia usa a categoria escolhida.
  const photoSpecies = species ?? {
    id: '',
    category: customSpecies?.category ?? 'fish',
    commonName: customSpecies?.commonName || 'Nova espécie',
  };

  return (
    <View style={styles.form}>
      {isCustom ? (
        <Card style={styles.section}>
          <AppText variant="subtitle">Nova espécie</AppText>
          <FormTextField
            control={control}
            name="customSpecies.commonName"
            label="Nome popular"
            placeholder="Ex.: Tetra-limão"
            maxLength={60}
          />
          <FormTextField
            control={control}
            name="customSpecies.scientificName"
            label="Nome científico"
            optional
            autoCapitalize="sentences"
            autoCorrect={false}
            placeholder="Ex.: Hyphessobrycon pulchripinnis"
            maxLength={80}
          />
          <Controller
            control={control}
            name="customSpecies.category"
            render={({ field, fieldState }) => (
              <Field label="Categoria" error={fieldState.error?.message}>
                <View style={styles.chips}>
                  {SPECIES_CATEGORIES.map((category) => (
                    <Chip
                      key={category}
                      label={SPECIES_CATEGORY_LABELS[category]}
                      selected={field.value === category}
                      onPress={() => field.onChange(category)}
                    />
                  ))}
                </View>
              </Field>
            )}
          />
        </Card>
      ) : null}

      <Card style={styles.section}>
        <Controller
          control={control}
          name="imageUri"
          render={({ field }) => (
            <Field label="Foto" optional>
              <OrganismPhotoPicker
                value={field.value}
                onChange={field.onChange}
                species={photoSpecies}
                compact={compactPhoto}
              />
            </Field>
          )}
        />
      </Card>

      <Card style={styles.section}>
        <FormTextField
          control={control}
          name="quantity"
          label="Quantidade"
          keyboardType="number-pad"
          maxLength={4}
          hint="Para plantas, use o número de mudas ou porções."
        />
        <Controller
          control={control}
          name="addedAt"
          render={({ field, fieldState }) => (
            <Field label="Data de introdução" optional error={fieldState.error?.message}>
              <DateField
                label="Data de introdução"
                value={field.value}
                onChange={field.onChange}
                hasError={Boolean(fieldState.error)}
              />
            </Field>
          )}
        />
        <FormTextField
          control={control}
          name="notes"
          label="Observações"
          optional
          multiline
          maxLength={300}
          placeholder="Origem, comportamento, cuidados…"
        />
      </Card>

      <Button label={submitLabel} loading={formState.isSubmitting} onPress={handleSubmit(onSubmit)} />
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: spacing.lg,
  },
  section: {
    gap: spacing.lg,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
});
