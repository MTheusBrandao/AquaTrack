import type { MaintenanceCategory } from '@/features/maintenance/types/maintenance';

export const EQUIPMENT_CATEGORIES = [
  'filter',
  'heater',
  'lighting',
  'pump',
  'skimmer',
  'co2',
  'other',
] as const;

export type EquipmentCategory = (typeof EQUIPMENT_CATEGORIES)[number];

export const EQUIPMENT_CATEGORY_LABELS: Record<EquipmentCategory, string> = {
  filter: 'Filtro',
  heater: 'Aquecedor',
  lighting: 'Iluminação',
  pump: 'Bomba',
  skimmer: 'Skimmer',
  co2: 'CO₂',
  other: 'Outro',
};

/** Atividade sugerida ao criar uma tarefa a partir de um equipamento. */
export const SUGGESTED_MAINTENANCE: Record<EquipmentCategory, MaintenanceCategory> = {
  filter: 'filter_cleaning',
  heater: 'other',
  lighting: 'other',
  pump: 'tank_cleaning',
  skimmer: 'filter_cleaning',
  co2: 'other',
  other: 'other',
};

export type Equipment = {
  id: string;
  aquariumId: string;
  aquariumName: string;
  name: string;
  category: EquipmentCategory;
  brand: string | null;
  model: string | null;
  powerWatts: number | null;
  /** Data local YYYY-MM-DD. */
  installedAt: string | null;
  notes: string | null;
  updatedAt: string;
};

export type EquipmentInput = Omit<Equipment, 'id' | 'aquariumName' | 'updatedAt'>;
