import { z } from 'zod';

import { parseDecimal, todayLocalDateString } from './format';

type Range = { min: number; max: number; unit: string };

const INVALID_NUMBER = 'Informe um número válido.';

function rangeMessage({ min, max, unit }: Range) {
  return `Use um valor entre ${String(min).replace('.', ',')} e ${max} ${unit}.`;
}

/** Campo numérico obrigatório digitado como texto (aceita vírgula). */
export function requiredDecimal(requiredMessage: string, range: Range) {
  return z
    .string()
    .trim()
    .min(1, requiredMessage)
    .transform(parseDecimal)
    .refine(Number.isFinite, INVALID_NUMBER)
    .refine((value) => value >= range.min && value <= range.max, rangeMessage(range));
}

/** Campo numérico opcional: texto vazio vira null (não medido ≠ zero). */
export function optionalDecimal(range: Range) {
  return z
    .string()
    .trim()
    .transform((value) => (value === '' ? null : parseDecimal(value)))
    .refine((value) => value === null || Number.isFinite(value), INVALID_NUMBER)
    .refine(
      (value) => value === null || (value >= range.min && value <= range.max),
      rangeMessage(range),
    );
}

export function optionalText(max: number) {
  return z
    .string()
    .trim()
    .max(max, `Use no máximo ${max} caracteres.`)
    .transform((value) => (value === '' ? null : value));
}

/** Data de calendário YYYY-MM-DD que não pode estar no futuro. */
export const optionalPastDate = z
  .string()
  .nullable()
  .refine((value) => value === null || value <= todayLocalDateString(), 'A data não pode estar no futuro.');
