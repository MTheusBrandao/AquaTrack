import type { AquariumType } from '@/features/aquariums/types/aquarium';
import type { ParameterKey, ParameterType } from '@/features/monitoring/types/parameter';

export const PARAMETER_TYPES: ParameterType[] = [
  { id: 'temperature', name: 'Temperatura', unit: '°C', decimals: 1 },
  { id: 'ph', name: 'pH', unit: 'pH', decimals: 1 },
  { id: 'ammonia', name: 'Amônia', unit: 'mg/L', decimals: 2 },
  { id: 'nitrite', name: 'Nitrito', unit: 'mg/L', decimals: 2 },
  { id: 'nitrate', name: 'Nitrato', unit: 'mg/L', decimals: 1 },
  { id: 'gh', name: 'GH', unit: 'dGH', decimals: 1 },
  { id: 'kh', name: 'KH', unit: 'dKH', decimals: 1 },
];

/** Adicionados na migration 4. Seeds já distribuídos nunca são alterados. */
export const MARINE_PARAMETER_TYPES: ParameterType[] = [
  { id: 'salinity', name: 'Salinidade', unit: 'ppt', decimals: 1 },
  { id: 'calcium', name: 'Cálcio', unit: 'mg/L', decimals: 0 },
  { id: 'magnesium', name: 'Magnésio', unit: 'mg/L', decimals: 0 },
  { id: 'phosphate', name: 'Fosfato', unit: 'mg/L', decimals: 2 },
];

type ReferenceSeed = {
  parameterId: ParameterKey;
  aquariumType: AquariumType;
  min: number | null;
  max: number | null;
  description: string;
};

/**
 * Faixas GERAIS de referência por tipo de água, para sinalizar valores que merecem atenção.
 * Não são ideais universais: espécies específicas podem exigir faixas diferentes.
 * A existência de uma linha define que o parâmetro se aplica àquele tipo de aquário;
 * min/max nulos significam "aplicável, mas sem faixa geral definida".
 */
export const PARAMETER_REFERENCES: ReferenceSeed[] = [
  // Água doce (comunitário tropical)
  { parameterId: 'temperature', aquariumType: 'freshwater', min: 22, max: 28, description: 'Faixa comum para aquários tropicais comunitários.' },
  { parameterId: 'ph', aquariumType: 'freshwater', min: 6.5, max: 7.8, description: 'Muitas espécies toleram essa faixa; algumas preferem água mais ácida ou alcalina.' },
  { parameterId: 'ammonia', aquariumType: 'freshwater', min: 0, max: 0, description: 'Em aquário ciclado, a amônia deve ficar indetectável.' },
  { parameterId: 'nitrite', aquariumType: 'freshwater', min: 0, max: 0, description: 'Em aquário ciclado, o nitrito deve ficar indetectável.' },
  { parameterId: 'nitrate', aquariumType: 'freshwater', min: 0, max: 40, description: 'Valores altos indicam necessidade de trocas parciais.' },
  { parameterId: 'gh', aquariumType: 'freshwater', min: 4, max: 12, description: 'Dureza geral comum para peixes comunitários.' },
  { parameterId: 'kh', aquariumType: 'freshwater', min: 3, max: 8, description: 'KH baixo deixa o pH instável.' },
  // Marinho
  { parameterId: 'temperature', aquariumType: 'saltwater', min: 24, max: 27, description: 'Faixa comum para aquários de recife.' },
  { parameterId: 'ph', aquariumType: 'saltwater', min: 7.8, max: 8.4, description: 'Faixa usual da água do mar.' },
  { parameterId: 'ammonia', aquariumType: 'saltwater', min: 0, max: 0, description: 'Em aquário ciclado, a amônia deve ficar indetectável.' },
  { parameterId: 'nitrite', aquariumType: 'saltwater', min: 0, max: 0, description: 'Em aquário ciclado, o nitrito deve ficar indetectável.' },
  { parameterId: 'nitrate', aquariumType: 'saltwater', min: 0, max: 20, description: 'Corais costumam exigir nitrato baixo.' },
  { parameterId: 'kh', aquariumType: 'saltwater', min: 7, max: 11, description: 'Alcalinidade importante para corais.' },
  // Salobra
  { parameterId: 'temperature', aquariumType: 'brackish', min: 24, max: 28, description: 'Faixa comum para espécies de água salobra.' },
  { parameterId: 'ph', aquariumType: 'brackish', min: 7.5, max: 8.4, description: 'Água salobra tende a ser alcalina.' },
  { parameterId: 'ammonia', aquariumType: 'brackish', min: 0, max: 0, description: 'Em aquário ciclado, a amônia deve ficar indetectável.' },
  { parameterId: 'nitrite', aquariumType: 'brackish', min: 0, max: 0, description: 'Em aquário ciclado, o nitrito deve ficar indetectável.' },
  { parameterId: 'nitrate', aquariumType: 'brackish', min: 0, max: 40, description: 'Valores altos indicam necessidade de trocas parciais.' },
  { parameterId: 'gh', aquariumType: 'brackish', min: null, max: null, description: 'Varia muito conforme a salinidade e a espécie.' },
  { parameterId: 'kh', aquariumType: 'brackish', min: null, max: null, description: 'Varia muito conforme a salinidade e a espécie.' },
];

export const MARINE_PARAMETER_REFERENCES: ReferenceSeed[] = [
  { parameterId: 'salinity', aquariumType: 'saltwater', min: 33, max: 36, description: 'Equivale a densidade de cerca de 1,024 a 1,027. Muitos recifes usam 35 ppt.' },
  { parameterId: 'calcium', aquariumType: 'saltwater', min: 380, max: 450, description: 'Necessário para corais duros e algas calcárias.' },
  { parameterId: 'magnesium', aquariumType: 'saltwater', min: 1250, max: 1400, description: 'Ajuda a manter cálcio e alcalinidade estáveis.' },
  { parameterId: 'phosphate', aquariumType: 'saltwater', min: 0, max: 0.1, description: 'Valores altos favorecem algas; aquários só com peixes toleram mais.' },
  { parameterId: 'salinity', aquariumType: 'brackish', min: null, max: null, description: 'Varia muito conforme a espécie (de quase doce a quase marinho).' },
];
