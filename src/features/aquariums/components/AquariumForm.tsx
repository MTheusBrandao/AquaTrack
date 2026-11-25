import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';

import { DateField, Field, FormTextField, SegmentedControl } from '@/components/forms';
import { AppText, Button, Card } from '@/components/ui';
import { spacing } from '@/theme';

import {
  aquariumSchema,
  type AquariumFormOutput,
  type AquariumFormValues,
} from '../schemas/aquariumSchema';
import { AQUARIUM_TYPE_LABELS, AQUARIUM_TYPES } from '../types/aquarium';
import { AquariumImagePicker } from './AquariumImagePicker';

const TYPE_OPTIONS = AQUARIUM_TYPES.map((value) => ({ value, label: AQUARIUM_TYPE_LABELS[value] }));

type AquariumFormProps = {
  defaultValues: AquariumFormValues;
  submitLabel: string;
  onSubmit: (values: AquariumFormOutput) => Promise<void>;
};

export function AquariumForm({ defaultValues, submitLabel, onSubmit }: AquariumFormProps) {
  const { control, handleSubmit, formState } = useForm<AquariumFormValues, unknown, AquariumFormOutput>({
    resolver: zodResolver(aquariumSchema),
    defaultValues,
  });

  return (
    <View style={styles.form}>
      <Card style={styles.section}>
        <Controller
          control={control}
          name="imageUri"
          render={({ field }) => (
            <Field label="Foto" optional>
              <AquariumImagePicker value={field.value} onChange={field.onChange} />
            </Field>
          )}
        />
      </Card>

      <Card style={styles.section}>
        <AppText variant="subtitle">Identificação</AppText>
        <FormTextField control={control} name="name" label="Nome" placeholder="Ex.: Plantado da sala" maxLength={60} />
        <Controller
          control={control}
          name="type"
          render={({ field, fieldState }) => (
            <Field
              label="Tipo de água"
              error={fieldState.error?.message}
              hint="Define o catálogo de espécies e, nas próximas etapas, as faixas de parâmetros.">
              <SegmentedControl options={TYPE_OPTIONS} value={field.value} onChange={field.onChange} />
            </Field>
          )}
        />
        <Controller
          control={control}
          name="setupDate"
          render={({ field, fieldState }) => (
            <Field label="Data de montagem" optional error={fieldState.error?.message}>
              <DateField
                label="Data de montagem"
                value={field.value}
                onChange={field.onChange}
                hasError={Boolean(fieldState.error)}
              />
            </Field>
          )}
        />
      </Card>

      <Card style={styles.section}>
        <AppText variant="subtitle">Dimensões</AppText>
        <FormTextField control={control} name="volume" label="Volume" suffix="L" keyboardType="decimal-pad" placeholder="Ex.: 120" />
        <View style={styles.row}>
          <View style={styles.rowItem}>
            <FormTextField control={control} name="length" label="Compr." optional suffix="cm" keyboardType="decimal-pad" />
          </View>
          <View style={styles.rowItem}>
            <FormTextField control={control} name="width" label="Largura" optional suffix="cm" keyboardType="decimal-pad" />
          </View>
          <View style={styles.rowItem}>
            <FormTextField control={control} name="height" label="Altura" optional suffix="cm" keyboardType="decimal-pad" />
          </View>
        </View>
        <FormTextField
          control={control}
          name="targetTemperature"
          label="Temperatura desejada"
          optional
          suffix="°C"
          keyboardType="decimal-pad"
          placeholder="Ex.: 26"
        />
      </Card>

      <Card style={styles.section}>
        <FormTextField
          control={control}
          name="description"
          label="Descrição"
          optional
          multiline
          maxLength={500}
          placeholder="Iluminação, substrato, filtragem…"
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
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  rowItem: {
    flex: 1,
  },
});
