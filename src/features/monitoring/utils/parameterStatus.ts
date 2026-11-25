import type { ParameterReference, ParameterStatus } from '../types/parameter';

export function getParameterStatus(value: number, reference: ParameterReference): ParameterStatus {
  const { minValue, maxValue } = reference;
  if (minValue === null && maxValue === null) return 'no_reference';
  if (minValue !== null && value < minValue) return 'out_of_range';
  if (maxValue !== null && value > maxValue) return 'out_of_range';
  return 'in_range';
}

export function formatParameterValue(value: number, decimals: number): string {
  return value.toLocaleString('pt-BR', { maximumFractionDigits: decimals });
}

export function formatReferenceRange(reference: ParameterReference, decimals: number, unit: string): string {
  const { minValue, maxValue } = reference;
  const fmt = (v: number) => formatParameterValue(v, decimals);
  if (minValue === null && maxValue === null) return 'Sem faixa geral definida';
  if (minValue !== null && maxValue !== null) {
    return minValue === maxValue ? `${fmt(minValue)} ${unit}` : `${fmt(minValue)} a ${fmt(maxValue)} ${unit}`;
  }
  return minValue !== null ? `acima de ${fmt(minValue)} ${unit}` : `até ${fmt(maxValue as number)} ${unit}`;
}

export const PARAMETER_STATUS_LABELS: Record<ParameterStatus, string> = {
  in_range: 'Dentro da faixa',
  out_of_range: 'Fora da faixa',
  no_reference: 'Sem referência',
};
