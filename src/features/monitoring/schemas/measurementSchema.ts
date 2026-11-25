import { z } from 'zod';

import { optionalDecimal, optionalText } from '@/utils/validation';

import type { ParameterKey } from '../types/parameter';

/**
 * Limites de plausibilidade (erros de digitação), diferentes das faixas de referência.
 * Um valor fora da referência é aceito e sinalizado; um valor impossível é rejeitado.
 */
const values = z.object({
  temperature: optionalDecimal({ min: 0, max: 45, unit: '°C' }),
  ph: optionalDecimal({ min: 0, max: 14, unit: '' }),
  ammonia: optionalDecimal({ min: 0, max: 20, unit: 'mg/L' }),
  nitrite: optionalDecimal({ min: 0, max: 20, unit: 'mg/L' }),
  nitrate: optionalDecimal({ min: 0, max: 500, unit: 'mg/L' }),
  gh: optionalDecimal({ min: 0, max: 50, unit: 'dGH' }),
  kh: optionalDecimal({ min: 0, max: 50, unit: 'dKH' }),
} satisfies Record<ParameterKey, unknown>);

const FUTURE_TOLERANCE_MS = 5 * 60 * 1000;

export const measurementSchema = z
  .object({
    measuredAt: z
      .string()
      .refine(
        (value) => new Date(value).getTime() <= Date.now() + FUTURE_TOLERANCE_MS,
        'A data da medição não pode estar no futuro.',
      ),
    notes: optionalText(300),
    values,
  })
  .refine((data) => Object.values(data.values).some((value) => value !== null), {
    message: 'Preencha pelo menos um parâmetro.',
    path: ['values'],
  });

export type MeasurementFormValues = z.input<typeof measurementSchema>;
export type MeasurementFormOutput = z.output<typeof measurementSchema>;

export function emptyMeasurementForm(): MeasurementFormValues {
  return {
    measuredAt: new Date().toISOString(),
    notes: '',
    values: { temperature: '', ph: '', ammonia: '', nitrite: '', nitrate: '', gh: '', kh: '' },
  };
}
