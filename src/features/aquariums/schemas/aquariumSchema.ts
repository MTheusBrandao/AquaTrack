import { z } from 'zod';

import { numberToInput } from '@/utils/format';
import { optionalDecimal, optionalPastDate, optionalText, requiredDecimal } from '@/utils/validation';

import { AQUARIUM_TYPES, type Aquarium, type AquariumInput } from '../types/aquarium';

export const aquariumSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Dê um nome ao aquário.')
    .max(60, 'Use no máximo 60 caracteres.'),
  type: z.enum(AQUARIUM_TYPES, 'Escolha o tipo de água.'),
  volume: requiredDecimal('Informe o volume.', { min: 1, max: 100000, unit: 'L' }),
  length: optionalDecimal({ min: 1, max: 1000, unit: 'cm' }),
  width: optionalDecimal({ min: 1, max: 1000, unit: 'cm' }),
  height: optionalDecimal({ min: 1, max: 1000, unit: 'cm' }),
  setupDate: optionalPastDate,
  targetTemperature: optionalDecimal({ min: 0, max: 40, unit: '°C' }),
  description: optionalText(500),
  imageUri: z.string().nullable(),
});

export type AquariumFormValues = z.input<typeof aquariumSchema>;

export const emptyAquariumForm: AquariumFormValues = {
  name: '',
  type: 'freshwater',
  volume: '',
  length: '',
  width: '',
  height: '',
  setupDate: null,
  targetTemperature: '',
  description: '',
  imageUri: null,
};

export function aquariumToForm(aquarium: Aquarium): AquariumFormValues {
  return {
    name: aquarium.name,
    type: aquarium.type,
    volume: numberToInput(aquarium.volume),
    length: numberToInput(aquarium.length),
    width: numberToInput(aquarium.width),
    height: numberToInput(aquarium.height),
    setupDate: aquarium.setupDate,
    targetTemperature: numberToInput(aquarium.targetTemperature),
    description: aquarium.description ?? '',
    imageUri: aquarium.imageUri,
  };
}

// Garante em tempo de compilação que a saída do schema bate com o tipo do domínio.
type AssertOutput<T extends AquariumInput> = T;
export type AquariumFormOutput = AssertOutput<z.output<typeof aquariumSchema>>;
