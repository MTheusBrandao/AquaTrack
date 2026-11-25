import type { SQLiteDatabase } from 'expo-sqlite';

import type {
  Equipment,
  EquipmentCategory,
  EquipmentInput,
} from '@/features/equipment/types/equipment';

type EquipmentRow = {
  id: string;
  aquarium_id: string;
  aquarium_name: string;
  name: string;
  category: EquipmentCategory;
  brand: string | null;
  model: string | null;
  power_watts: number | null;
  installed_at: string | null;
  notes: string | null;
  updated_at: string;
};

function toEquipment(row: EquipmentRow): Equipment {
  return {
    id: row.id,
    aquariumId: row.aquarium_id,
    aquariumName: row.aquarium_name,
    name: row.name,
    category: row.category,
    brand: row.brand,
    model: row.model,
    powerWatts: row.power_watts,
    installedAt: row.installed_at,
    notes: row.notes,
    updatedAt: row.updated_at,
  };
}

const SELECT = `
  SELECT e.*, a.name AS aquarium_name
  FROM equipment e
  JOIN aquariums a ON a.id = e.aquarium_id`;

export const equipmentRepository = {
  /** `aquariumId` nulo lista os equipamentos de todos os aquários. */
  async list(db: SQLiteDatabase, aquariumId: string | null): Promise<Equipment[]> {
    const rows = await db.getAllAsync<EquipmentRow>(
      `${SELECT}
       WHERE (? IS NULL OR e.aquarium_id = ?)
       ORDER BY e.category, e.name COLLATE NOCASE`,
      aquariumId,
      aquariumId,
    );
    return rows.map(toEquipment);
  },

  async findById(db: SQLiteDatabase, id: string): Promise<Equipment | null> {
    const row = await db.getFirstAsync<EquipmentRow>(`${SELECT} WHERE e.id = ?`, id);
    return row ? toEquipment(row) : null;
  },

  async insert(db: SQLiteDatabase, id: string, input: EquipmentInput, now: string): Promise<void> {
    await db.runAsync(
      `INSERT INTO equipment (
         id, aquarium_id, name, category, brand, model, power_watts, installed_at, notes, created_at, updated_at
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      id,
      input.aquariumId,
      input.name,
      input.category,
      input.brand,
      input.model,
      input.powerWatts,
      input.installedAt,
      input.notes,
      now,
      now,
    );
  },

  async update(db: SQLiteDatabase, id: string, input: EquipmentInput, now: string): Promise<void> {
    await db.runAsync(
      `UPDATE equipment SET
         aquarium_id = ?, name = ?, category = ?, brand = ?, model = ?, power_watts = ?,
         installed_at = ?, notes = ?, updated_at = ?
       WHERE id = ?`,
      input.aquariumId,
      input.name,
      input.category,
      input.brand,
      input.model,
      input.powerWatts,
      input.installedAt,
      input.notes,
      now,
      id,
    );
  },

  /** Tarefas vinculadas perdem o vínculo (ON DELETE SET NULL), mas continuam existindo. */
  async remove(db: SQLiteDatabase, id: string): Promise<void> {
    await db.runAsync('DELETE FROM equipment WHERE id = ?', id);
  },
};
