import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { StyleSheet, Switch, View } from 'react-native';

import { DateTimeField, Field, FormTextField } from '@/components/forms';
import { AppText, Button, Card, Chip } from '@/components/ui';
import { colors, spacing } from '@/theme';

import {
  maintenanceSchema,
  type MaintenanceFormOutput,
  type MaintenanceFormValues,
} from '../schemas/maintenanceSchema';
import {
  FREQUENCIES,
  FREQUENCY_LABELS,
  MAINTENANCE_CATEGORIES,
  MAINTENANCE_CATEGORY_LABELS,
} from '../types/maintenance';

type MaintenanceFormProps = {
  aquariums: { id: string; name: string }[];
  equipment: { id: string; aquariumId: string; name: string }[];
  defaultValues: MaintenanceFormValues;
  submitLabel: string;
  onSubmit: (values: MaintenanceFormOutput) => Promise<void>;
};

export function MaintenanceForm({
  aquariums,
  equipment,
  defaultValues,
  submitLabel,
  onSubmit,
}: MaintenanceFormProps) {
  const { control, handleSubmit, formState, setValue } = useForm<
    MaintenanceFormValues,
    unknown,
    MaintenanceFormOutput
  >({
    resolver: zodResolver(maintenanceSchema),
    defaultValues,
  });
  const category = useWatch({ control, name: 'category' });
  const aquariumId = useWatch({ control, name: 'aquariumId' });
  const aquariumEquipment = equipment.filter((item) => item.aquariumId === aquariumId);

  return (
    <View style={styles.form}>
      <Card style={styles.section}>
        {aquariums.length > 1 ? (
          <Controller
            control={control}
            name="aquariumId"
            render={({ field, fieldState }) => (
              <Field label="Aquário" error={fieldState.error?.message}>
                <View style={styles.chips}>
                  {aquariums.map((aquarium) => (
                    <Chip
                      key={aquarium.id}
                      label={aquarium.name}
                      selected={field.value === aquarium.id}
                      onPress={() => {
                        // O equipamento pertence ao aquário: trocar o aquário desfaz o vínculo.
                        if (aquarium.id !== field.value) setValue('equipmentId', null);
                        field.onChange(aquarium.id);
                      }}
                    />
                  ))}
                </View>
              </Field>
            )}
          />
        ) : null}

        <Controller
          control={control}
          name="category"
          render={({ field, fieldState }) => (
            <Field label="Atividade" error={fieldState.error?.message}>
              <View style={styles.chips}>
                {MAINTENANCE_CATEGORIES.map((value) => (
                  <Chip
                    key={value}
                    label={MAINTENANCE_CATEGORY_LABELS[value]}
                    selected={field.value === value}
                    onPress={() => field.onChange(value)}
                  />
                ))}
              </View>
            </Field>
          )}
        />

        {aquariumEquipment.length ? (
          <Controller
            control={control}
            name="equipmentId"
            render={({ field }) => (
              <Field label="Equipamento" optional>
                <View style={styles.chips}>
                  <Chip label="Nenhum" selected={field.value === null} onPress={() => field.onChange(null)} />
                  {aquariumEquipment.map((item) => (
                    <Chip
                      key={item.id}
                      label={item.name}
                      selected={field.value === item.id}
                      onPress={() => field.onChange(item.id)}
                    />
                  ))}
                </View>
              </Field>
            )}
          />
        ) : null}

        <FormTextField
          control={control}
          name="title"
          label="Título"
          optional
          maxLength={60}
          placeholder={MAINTENANCE_CATEGORY_LABELS[category]}
          hint="Se ficar vazio, usamos o nome da atividade."
        />
      </Card>

      <Card style={styles.section}>
        <Controller
          control={control}
          name="scheduledAt"
          render={({ field, fieldState }) => (
            <Field label="Data e hora" error={fieldState.error?.message}>
              <DateTimeField
                label="Data e hora"
                value={field.value}
                onChange={field.onChange}
                hasError={Boolean(fieldState.error)}
              />
            </Field>
          )}
        />

        <Controller
          control={control}
          name="frequency"
          render={({ field, fieldState }) => (
            <Field
              label="Repetição"
              error={fieldState.error?.message}
              hint="Recorrências seguem o calendário: uma tarefa mensal no dia 31 cai no último dia dos meses curtos.">
              <View style={styles.chips}>
                {FREQUENCIES.map((value) => (
                  <Chip
                    key={value}
                    label={FREQUENCY_LABELS[value]}
                    selected={field.value === value}
                    onPress={() => field.onChange(value)}
                  />
                ))}
              </View>
            </Field>
          )}
        />

        <Controller
          control={control}
          name="reminderEnabled"
          render={({ field }) => (
            <View style={styles.switchRow}>
              <View style={styles.flex}>
                <AppText variant="label">Lembrete</AppText>
                <AppText variant="caption" color="textSecondary">
                  Notificação no horário da próxima execução.
                </AppText>
              </View>
              <Switch
                accessibilityLabel="Lembrete"
                value={field.value}
                onValueChange={field.onChange}
                trackColor={{ true: colors.primary, false: colors.border }}
              />
            </View>
          )}
        />
      </Card>

      <Card style={styles.section}>
        <FormTextField
          control={control}
          name="description"
          label="Descrição"
          optional
          multiline
          maxLength={300}
          placeholder="Ex.: trocar 30% da água, sifonar o substrato…"
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
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  flex: {
    flex: 1,
    gap: spacing.xxs,
  },
});
