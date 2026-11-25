import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';

import { DateField, Field, FormTextField } from '@/components/forms';
import { Button, Card, Chip } from '@/components/ui';
import { spacing } from '@/theme';

import {
  equipmentSchema,
  type EquipmentFormOutput,
  type EquipmentFormValues,
} from '../schemas/equipmentSchema';
import { EQUIPMENT_CATEGORIES, EQUIPMENT_CATEGORY_LABELS } from '../types/equipment';

type EquipmentFormProps = {
  defaultValues: EquipmentFormValues;
  submitLabel: string;
  onSubmit: (values: EquipmentFormOutput) => Promise<void>;
};

export function EquipmentForm({ defaultValues, submitLabel, onSubmit }: EquipmentFormProps) {
  const { control, handleSubmit, formState } = useForm<EquipmentFormValues, unknown, EquipmentFormOutput>({
    resolver: zodResolver(equipmentSchema),
    defaultValues,
  });

  return (
    <View style={styles.form}>
      <Card style={styles.section}>
        <Controller
          control={control}
          name="category"
          render={({ field, fieldState }) => (
            <Field label="Categoria" error={fieldState.error?.message}>
              <View style={styles.chips}>
                {EQUIPMENT_CATEGORIES.map((value) => (
                  <Chip
                    key={value}
                    label={EQUIPMENT_CATEGORY_LABELS[value]}
                    selected={field.value === value}
                    onPress={() => field.onChange(value)}
                  />
                ))}
              </View>
            </Field>
          )}
        />
        <FormTextField control={control} name="name" label="Nome" placeholder="Ex.: Filtro canister" maxLength={60} />
        <View style={styles.row}>
          <View style={styles.flex}>
            <FormTextField control={control} name="brand" label="Marca" optional maxLength={40} />
          </View>
          <View style={styles.flex}>
            <FormTextField control={control} name="model" label="Modelo" optional maxLength={40} />
          </View>
        </View>
        <FormTextField
          control={control}
          name="powerWatts"
          label="Potência"
          optional
          suffix="W"
          keyboardType="decimal-pad"
        />
        <Controller
          control={control}
          name="installedAt"
          render={({ field, fieldState }) => (
            <Field label="Instalado em" optional error={fieldState.error?.message}>
              <DateField
                label="Instalado em"
                value={field.value}
                onChange={field.onChange}
                hasError={Boolean(fieldState.error)}
              />
            </Field>
          )}
        />
      </Card>

      <Card style={styles.section}>
        <FormTextField
          control={control}
          name="notes"
          label="Observações"
          optional
          multiline
          maxLength={300}
          placeholder="Mídias filtrantes, configuração, garantia…"
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
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  flex: {
    flex: 1,
  },
});
