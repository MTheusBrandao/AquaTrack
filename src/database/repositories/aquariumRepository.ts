import type { SQLiteDatabase } from 'expo-sqlite';

import type {
  Aquarium,
  AquariumInput,
  AquariumType,
  AquariumWithStats,
} from '@/features/aquariums/types/aquarium';

type AquariumRow = {
  id: string;
  name: string;
  type: AquariumType;
  volume: number;
  length: number | null;
  width: number | null;
  height: number | null;
  setup_date: string | null;
  target_temperature: number | null;
  description: string | null;
  image_uri: string | null;
  is_demo: number;
  created_at: string;
  updated_at: string;
};

function toAquarium(row: AquariumRow): Aquarium {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    volume: row.volume,
    length: row.length,
    width: row.width,
    height: row.height,
    setupDate: row.setup_date,
    targetTemperature: row.target_temperature,
    description: row.description,
    imageUri: row.image_uri,
    isDemo: row.is_demo === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export const aquariumRepository = {
  async listWithStats(db: SQLiteDatabase): Promise<AquariumWithStats[]> {
    const rows = await db.getAllAsync<AquariumRow & { species_count: number }>(
      `SELECT a.*, COUNT(s.id) AS species_count
       FROM aquariums a
       LEFT JOIN aquarium_species s ON s.aquarium_id = a.id
       GROUP BY a.id
       ORDER BY a.created_at DESC`,
    );
    return rows.map((row) => ({ ...toAquarium(row), speciesCount: row.species_count }));
  },

  async findById(db: SQLiteDatabase, id: string): Promise<Aquarium | null> {
    const row = await db.getFirstAsync<AquariumRow>('SELECT * FROM aquariums WHERE id = ?', id);
    return row ? toAquarium(row) : null;
  },

  async insert(db: SQLiteDatabase, id: string, input: AquariumInput, now: string): Promise<void> {
    await db.runAsync(
      `INSERT INTO aquariums (
         id, name, type, volume, length, width, height, setup_date,
         target_temperature, description, image_uri, created_at, updated_at
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      id,
      input.name,
      input.type,
      input.volume,
      input.length,
      input.width,
      input.height,
      input.setupDate,
      input.targetTemperature,
      input.description,
      input.imageUri,
      now,
      now,
    );
  },

  async update(db: SQLiteDatabase, id: string, input: AquariumInput, now: string): Promise<void> {
    await db.runAsync(
      `UPDATE aquariums SET
         name = ?, type = ?, volume = ?, length = ?, width = ?, height = ?, setup_date = ?,
         target_temperature = ?, description = ?, image_uri = ?, updated_at = ?
       WHERE id = ?`,
      input.name,
      input.type,
      input.volume,
      input.length,
      input.width,
      input.height,
      input.setupDate,
      input.targetTemperature,
      input.description,
      input.imageUri,
      now,
      id,
    );
  },

  async markDemo(db: SQLiteDatabase, id: string): Promise<void> {
    await db.runAsync('UPDATE aquariums SET is_demo = 1 WHERE id = ?', id);
  },

  async listDemoIds(db: SQLiteDatabase): Promise<string[]> {
    const rows = await db.getAllAsync<{ id: string }>('SELECT id FROM aquariums WHERE is_demo = 1');
    return rows.map((row) => row.id);
  },

  /** Organismos do aquário são removidos em cascata (ON DELETE CASCADE). */
  async remove(db: SQLiteDatabase, id: string): Promise<void> {
    await db.runAsync('DELETE FROM aquariums WHERE id = ?', id);
  },
};
