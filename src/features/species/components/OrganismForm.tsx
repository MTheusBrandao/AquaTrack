import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';

import { DateField, Field, FormTextField } from '@/components/forms';
import { AppText, Button, Card, Chip } from '@/components/ui';
import { spacing } from '@/theme';

import {
  organismSchema,
  type OrganismFormOutput,
  type OrganismFormValues,
} from '../schemas/organismSchema';
import { SPECIES_CATEGORIES, SPECIES_CATEGORY_LABELS } from '../types/species';

type OrganismFormProps = {
  defaultValues: OrganismFormValues;
  submitLabel: string;
  onSubmit: (values: OrganismFormOutput) => Promise<void>;
};

export function OrganismForm({ defaultValues, submitLabel, onSubmit }: OrganismFormProps) {
  const { control, handleSubmit, formState } = useForm<OrganismFormValues, unknown, OrganismFormOutput>({
    resolver: zodResolver(organismSchema),
    defaultValues,
  });
  const isCustom = defaultValues.customSpecies !== null;

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
