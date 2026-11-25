import type { SQLiteDatabase } from 'expo-sqlite';

/**
 * Equipamentos de cada aquário. Tarefas de manutenção podem apontar para um equipamento;
 * excluir o equipamento mantém a tarefa, só desfaz o vínculo (ON DELETE SET NULL).
 */
export async function up(db: SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    CREATE TABLE equipment (
      id TEXT PRIMARY KEY NOT NULL,
      aquarium_id TEXT NOT NULL REFERENCES aquariums (id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      category TEXT NOT NULL CHECK (category IN (
        'filter', 'heater', 'lighting', 'pump', 'skimmer', 'co2', 'other'
      )),
      brand TEXT,
      model TEXT,
      power_watts REAL CHECK (power_watts IS NULL OR power_watts > 0),
      installed_at TEXT,
      notes TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX idx_equipment_aquarium ON equipment (aquarium_id);

    ALTER TABLE maintenance_tasks
      ADD COLUMN equipment_id TEXT REFERENCES equipment (id) ON DELETE SET NULL;

    CREATE INDEX idx_maintenance_tasks_equipment ON maintenance_tasks (equipment_id);
  `);
}
