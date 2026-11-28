import type { AquariumType } from '@/features/aquariums/types/aquarium';

export const SPECIES_CATEGORIES = [
  'fish',
  'plant',
  'coral',
  'shrimp',
  'snail',
  'other_invertebrate',
] as const;

export type SpeciesCategory = (typeof SPECIES_CATEGORIES)[number];

export const SPECIES_CATEGORY_LABELS: Record<SpeciesCategory, string> = {
  fish: 'Peixes',
  plant: 'Plantas',
  coral: 'Corais',
  shrimp: 'Camarões',
  snail: 'Caracóis',
  other_invertebrate: 'Outros invertebrados',
};

export type Species = {
  id: string;
  commonName: string;
  scientificName: string | null;
  category: SpeciesCategory;
  /** Tipo de água típico; null para espécies cadastradas sem essa informação. */
  waterType: AquariumType | null;
  description: string | null;
  isCustom: boolean;
};

export type CustomSpeciesInput = {
  commonName: string;
  scientificName: string | null;
  category: SpeciesCategory;
  waterType: AquariumType;
};

/** Organismo presente em um aquário (tabela aquarium_species). */
export type AquariumOrganism = {
  id: string;
  aquariumId: string;
  quantity: number;
  /** Data local no formato YYYY-MM-DD */
  addedAt: string | null;
  notes: string | null;
  /** Caminho relativo da foto no armazenamento do app, ou URI temporário recém-escolhido. */
  imageUri: string | null;
  species: Species;
};

export type AquariumOrganismInput = {
  quantity: number;
  addedAt: string | null;
  notes: string | null;
  imageUri: string | null;
};
