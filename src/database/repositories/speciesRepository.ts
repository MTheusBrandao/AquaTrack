import type { SQLiteDatabase } from 'expo-sqlite';

import type { AquariumType } from '@/features/aquariums/types/aquarium';
import type {
  AquariumOrganism,
  AquariumOrganismInput,
  CustomSpeciesInput,
  Species,
  SpeciesCategory,
} from '@/features/species/types/species';

type SpeciesRow = {
  id: string;
  common_name: string;
  scientific_name: string | null;
  category: SpeciesCategory;
  water_type: AquariumType | null;
  description: string | null;
  is_custom: number;
};

type OrganismRow = {
  organism_id: string;
  aquarium_id: string;
  quantity: number;
  added_at: string | null;
  notes: string | null;
  organism_image_uri: string | null;
} & SpeciesRow;

function toSpecies(row: SpeciesRow): Species {
  return {
    id: row.id,
    commonName: row.common_name,
    scientificName: row.scientific_name,
    category: row.category,
    waterType: row.water_type,
    description: row.description,
    isCustom: row.is_custom === 1,
  };
}

function toOrganism(row: OrganismRow): AquariumOrganism {
  return {
    id: row.organism_id,
    aquariumId: row.aquarium_id,
    quantity: row.quantity,
    addedAt: row.added_at,
    notes: row.notes,
    imageUri: row.organism_image_uri,
    species: toSpecies(row),
  };
}

const ORGANISM_SELECT = `
  SELECT
    o.id AS organism_id, o.aquarium_id, o.quantity, o.added_at, o.notes,
    o.image_uri AS organism_image_uri,
    s.id, s.common_name, s.scientific_name, s.category, s.water_type, s.description, s.is_custom
  FROM aquarium_species o
  JOIN species s ON s.id = o.species_id`;

export const speciesRepository = {
  /** Espécies compatíveis com o tipo de água, incluindo as cadastradas pelo usuário sem tipo. */
  async listForWaterType(db: SQLiteDatabase, waterType: AquariumType): Promise<Species[]> {
    const rows = await db.getAllAsync<SpeciesRow>(
      `SELECT * FROM species
       WHERE water_type = ? OR water_type IS NULL
       ORDER BY is_custom DESC, common_name COLLATE NOCASE`,
      waterType,
    );
    return rows.map(toSpecies);
  },

  async insertCustom(
    db: SQLiteDatabase,
    id: string,
    input: CustomSpeciesInput,
    now: string,
  ): Promise<void> {
    await db.runAsync(
      `INSERT INTO species (id, common_name, scientific_name, category, water_type, is_custom, created_at)
       VALUES (?, ?, ?, ?, ?, 1, ?)`,
      id,
      input.commonName,
      input.scientificName,
      input.category,
      input.waterType,
      now,
    );
  },

  async listOrganisms(db: SQLiteDatabase, aquariumId: string): Promise<AquariumOrganism[]> {
    const rows = await db.getAllAsync<OrganismRow>(
      `${ORGANISM_SELECT}
       WHERE o.aquarium_id = ?
       ORDER BY s.category, s.common_name COLLATE NOCASE`,
      aquariumId,
    );
    return rows.map(toOrganism);
  },

  async findOrganism(db: SQLiteDatabase, id: string): Promise<AquariumOrganism | null> {
    const row = await db.getFirstAsync<OrganismRow>(`${ORGANISM_SELECT} WHERE o.id = ?`, id);
    return row ? toOrganism(row) : null;
  },

  async insertOrganism(
    db: SQLiteDatabase,
    id: string,
    aquariumId: string,
    speciesId: string,
    input: AquariumOrganismInput,
    now: string,
  ): Promise<void> {
    await db.runAsync(
      `INSERT INTO aquarium_species (id, aquarium_id, species_id, quantity, added_at, notes, image_uri, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      id,
      aquariumId,
      speciesId,
      input.quantity,
      input.addedAt,
      input.notes,
      input.imageUri,
      now,
    );
  },

  async updateOrganism(db: SQLiteDatabase, id: string, input: AquariumOrganismInput): Promise<void> {
    await db.runAsync(
      'UPDATE aquarium_species SET quantity = ?, added_at = ?, notes = ?, image_uri = ? WHERE id = ?',
      input.quantity,
      input.addedAt,
      input.notes,
      input.imageUri,
      id,
    );
  },

  /** Fotos dos organismos de um aquário, para limpar os arquivos antes da exclusão em cascata. */
  async listOrganismImages(db: SQLiteDatabase, aquariumId: string): Promise<string[]> {
    const rows = await db.getAllAsync<{ image_uri: string }>(
      'SELECT image_uri FROM aquarium_species WHERE aquarium_id = ? AND image_uri IS NOT NULL',
      aquariumId,
    );
    return rows.map((row) => row.image_uri);
  },

  async removeOrganism(db: SQLiteDatabase, id: string): Promise<void> {
    await db.runAsync('DELETE FROM aquarium_species WHERE id = ?', id);
  },
};
