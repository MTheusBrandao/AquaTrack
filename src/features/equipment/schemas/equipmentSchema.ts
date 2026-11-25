import { z } from 'zod';

import { numberToInput } from '@/utils/format';
import { optionalDecimal, optionalPastDate, optionalText } from '@/utils/validation';

import { EQUIPMENT_CATEGORIES, type Equipment, type EquipmentInput } from '../types/equipment';

export const equipmentSchema = z.object({
  aquariumId: z.string().min(1),
  name: z.string().trim().min(1, 'Dê um nome ao equipamento.').max(60, 'Use no máximo 60 caracteres.'),
  category: z.enum(EQUIPMENT_CATEGORIES, 'Escolha a categoria.'),
  brand: optionalText(40),
  model: optionalText(40),
  powerWatts: optionalDecimal({ min: 0.1, max: 5000, unit: 'W' }),
  installedAt: optionalPastDate,
  notes: optionalText(300),
});

export type EquipmentFormValues = z.input<typeof equipmentSchema>;

type AssertOutput<T extends EquipmentInput> = T;
export type EquipmentFormOutput = AssertOutput<z.output<typeof equipmentSchema>>;

export function emptyEquipmentForm(aquariumId: string): EquipmentFormValues {
  return {
    aquariumId,
    name: '',
    category: 'filter',
    brand: '',
    model: '',
    powerWatts: '',
    installedAt: null,
    notes: '',
  };
}

export function equipmentToForm(equipment: Equipment): EquipmentFormValues {
  return {
    aquariumId: equipment.aquariumId,
    name: equipment.name,
    category: equipment.category,
    brand: equipment.brand ?? '',
    model: equipment.model ?? '',
    powerWatts: numberToInput(equipment.powerWatts),
    installedAt: equipment.installedAt,
    notes: equipment.notes ?? '',
  };
}
