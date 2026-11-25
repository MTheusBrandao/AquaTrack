import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';

import { DateTimeField, Field, FormTextField } from '@/components/forms';
import { AppText, Button, Card } from '@/components/ui';
import { spacing } from '@/theme';

import {
  emptyMeasurementForm,
  measurementSchema,
  type MeasurementFormOutput,
  type MeasurementFormValues,
} from '../schemas/measurementSchema';
import type { ApplicableParameter } from '../types/parameter';
import { formatReferenceRange } from '../utils/parameterStatus';

type MeasurementFormProps = {
  parameters: ApplicableParameter[];
  onSubmit: (values: MeasurementFormOutput) => Promise<void>;
};

export function MeasurementForm({ parameters, onSubmit }: MeasurementFormProps) {
  const { control, handleSubmit, formState } = useForm<
    MeasurementFormValues,
    unknown,
    MeasurementFormOutput
  >({
    resolver: zodResolver(measurementSchema),
    defaultValues: emptyMeasurementForm(),
  });
  const valuesError = formState.errors.values?.message ?? formState.errors.values?.root?.message;

  return (
    <View style={styles.form}>
      <Card style={styles.section}>
        <Controller
          control={control}
          name="measuredAt"
          render={({ field, fieldState }) => (
            <Field label="Data e hora da medição" error={fieldState.error?.message}>
              <DateTimeField
                label="Data e hora da medição"
                value={field.value}
                onChange={field.onChange}
                maximumDate={new Date()}
                hasError={Boolean(fieldState.error)}
              />
            </Field>
          )}
        />
      </Card>

      <Card style={styles.section}>
        <View style={styles.header}>
          <AppText variant="subtitle">Parâmetros</AppText>
          <AppText variant="caption" color="textSecondary">
            Preencha só o que você mediu. Campo vazio significa “não medido”; para zero, digite 0.
          </AppText>
        </View>
        {parameters.map((parameter) => (
          <FormTextField
            key={parameter.id}
            control={control}
            name={`values.${parameter.id}`}
            label={parameter.name}
            optional
            suffix={parameter.unit === 'pH' ? undefined : parameter.unit}
            keyboardType="decimal-pad"
            hint={`Referência: ${formatReferenceRange(parameter.reference, parameter.decimals, parameter.unit)}`}
          />
        ))}
        {valuesError ? (
          <AppText variant="caption" color="critical">
            {valuesError}
          </AppText>
        ) : null}
      </Card>

      <Card style={styles.section}>
        <FormTextField
          control={control}
          name="notes"
          label="Observações"
          optional
          multiline
          maxLength={300}
          placeholder="Kit usado, condições do aquário…"
        />
      </Card>

      <Button label="Salvar medição" loading={formState.isSubmitting} onPress={handleSubmit(onSubmit)} />
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
  header: {
    gap: spacing.xs,
  },
});
