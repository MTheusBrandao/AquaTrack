export const PARAMETER_KEYS = [
  'temperature',
  'ph',
  'ammonia',
  'nitrite',
  'nitrate',
  'gh',
  'kh',
] as const;

export type ParameterKey = (typeof PARAMETER_KEYS)[number];

export type ParameterType = {
  id: ParameterKey;
  name: string;
  unit: string;
  /** Casas decimais usadas para exibir e aceitar valores. */
  decimals: number;
};

/** Faixa geral de referência para um tipo de aquário. min/max nulos = sem limite definido. */
export type ParameterReference = {
  parameterId: ParameterKey;
  minValue: number | null;
  maxValue: number | null;
  description: string | null;
};

/** Parâmetro aplicável a um aquário, com a faixa de referência do seu tipo de água. */
export type ApplicableParameter = ParameterType & {
  reference: ParameterReference;
};

export type ParameterRecord = {
  id: string;
  aquariumId: string;
  parameterId: ParameterKey;
  value: number;
  /** Instante ISO 8601 (UTC). */
  measuredAt: string;
  notes: string | null;
};

/**
 * Situação de um valor em relação à faixa de referência.
 * `no_reference`: não há faixa configurada para este parâmetro/tipo de aquário.
 */
export type ParameterStatus = 'in_range' | 'out_of_range' | 'no_reference';

export type MeasurementInput = {
  measuredAt: string;
  notes: string | null;
  /** null = não medido (nenhum registro é gravado). */
  values: Record<ParameterKey, number | null>;
};
