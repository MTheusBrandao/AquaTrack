import { z } from 'zod';

import { optionalText } from '@/utils/validation';

import {
  FREQUENCIES,
  MAINTENANCE_CATEGORIES,
  MAINTENANCE_CATEGORY_LABELS,
  type MaintenanceCategory,
  type MaintenanceInput,
  type MaintenanceTask,
} from '../types/maintenance';

export const maintenanceSchema = z
  .object({
    aquariumId: z.string().min(1, 'Escolha o aquário.'),
    category: z.enum(MAINTENANCE_CATEGORIES, 'Escolha o tipo de atividade.'),
    title: z.string().trim().max(60, 'Use no máximo 60 caracteres.'),
    description: optionalText(300),
    frequency: z.enum(FREQUENCIES, 'Escolha a frequência.'),
    scheduledAt: z.string().min(1, 'Escolha data e hora.'),
    reminderEnabled: z.boolean(),
    equipmentId: z.string().nullable(),
  })
  // Título vazio usa o nome da categoria, para não obrigar o usuário a digitar o óbvio.
  .transform((values) => ({
    ...values,
    title: values.title || MAINTENANCE_CATEGORY_LABELS[values.category],
  }));

export type MaintenanceFormValues = z.input<typeof maintenanceSchema>;

type AssertOutput<T extends MaintenanceInput> = T;
export type MaintenanceFormOutput = AssertOutput<z.output<typeof maintenanceSchema>>;

/** Sugestão inicial: amanhã às 9h. */
function defaultSchedule(): string {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  date.setHours(9, 0, 0, 0);
  return date.toISOString();
}

export function emptyMaintenanceForm(
  aquariumId: string,
  preset?: { equipmentId: string; category: MaintenanceCategory },
): MaintenanceFormValues {
  return {
    aquariumId,
    equipmentId: preset?.equipmentId ?? null,
    category: preset?.category ?? 'water_change',
    title: '',
    description: '',
    frequency: 'weekly',
    scheduledAt: defaultSchedule(),
    reminderEnabled: true,
  };
}

export function maintenanceToForm(task: MaintenanceTask): MaintenanceFormValues {
  return {
    aquariumId: task.aquariumId,
    category: task.category,
    title: task.title,
    description: task.description ?? '',
    frequency: task.frequency,
    scheduledAt: task.scheduledAt,
    reminderEnabled: task.reminderEnabled,
    equipmentId: task.equipmentId,
  };
}
