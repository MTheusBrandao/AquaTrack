import type { SQLiteDatabase } from 'expo-sqlite';

import { PARAMETER_REFERENCES, PARAMETER_TYPES } from '../seeds/parameters';

/**
 * Parâmetros da água e manutenções.
 *
 * Manutenção foi separada em duas tabelas: `maintenance_tasks` guarda a definição e a
 * próxima execução; `maintenance_logs` guarda cada conclusão. Com uma tabela só, concluir
 * uma tarefa recorrente sobrescreveria a conclusão anterior e o histórico se perderia.
 * O status "atrasada" não é gravado: é calculado na leitura comparando com a hora atual.
 */
export async function up(db: SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    CREATE TABLE parameter_types (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      unit TEXT NOT NULL,
      decimals INTEGER NOT NULL DEFAULT 1,
      sort_order INTEGER NOT NULL
    );

    CREATE TABLE parameter_references (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      parameter_type_id TEXT NOT NULL REFERENCES parameter_types (id) ON DELETE CASCADE,
      aquarium_type TEXT NOT NULL CHECK (aquarium_type IN ('freshwater', 'saltwater', 'brackish')),
      min_value REAL,
      max_value REAL,
      reference_description TEXT,
      UNIQUE (parameter_type_id, aquarium_type),
      CHECK (min_value IS NULL OR max_value IS NULL OR min_value <= max_value)
    );

    CREATE TABLE parameter_records (
      id TEXT PRIMARY KEY NOT NULL,
      aquarium_id TEXT NOT NULL REFERENCES aquariums (id) ON DELETE CASCADE,
      parameter_type_id TEXT NOT NULL REFERENCES parameter_types (id) ON DELETE RESTRICT,
      value REAL NOT NULL,
      measured_at TEXT NOT NULL,
      notes TEXT,
      created_at TEXT NOT NULL
    );

    CREATE INDEX idx_parameter_records_lookup
      ON parameter_records (aquarium_id, parameter_type_id, measured_at);

    CREATE TABLE maintenance_tasks (
      id TEXT PRIMARY KEY NOT NULL,
      aquarium_id TEXT NOT NULL REFERENCES aquariums (id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      category TEXT NOT NULL CHECK (category IN (
        'water_change', 'filter_cleaning', 'parameter_test', 'plant_trimming',
        'tank_cleaning', 'nutrient_dosing', 'feeding', 'other'
      )),
      description TEXT,
      frequency TEXT NOT NULL CHECK (frequency IN ('once', 'daily', 'weekly', 'biweekly', 'monthly')),
      -- Primeira ocorrência: âncora da recorrência (evita deriva de 31/01 → 28/02 → 28/03).
      starts_at TEXT NOT NULL,
      scheduled_at TEXT NOT NULL,
      completed_at TEXT,
      reminder_enabled INTEGER NOT NULL DEFAULT 1 CHECK (reminder_enabled IN (0, 1)),
      notification_id TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX idx_maintenance_tasks_schedule ON maintenance_tasks (completed_at, scheduled_at);
    CREATE INDEX idx_maintenance_tasks_aquarium ON maintenance_tasks (aquarium_id);

    CREATE TABLE maintenance_logs (
      id TEXT PRIMARY KEY NOT NULL,
      task_id TEXT REFERENCES maintenance_tasks (id) ON DELETE SET NULL,
      aquarium_id TEXT NOT NULL REFERENCES aquariums (id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      scheduled_for TEXT NOT NULL,
      completed_at TEXT NOT NULL
    );

    CREATE INDEX idx_maintenance_logs_completed ON maintenance_logs (completed_at);
    CREATE INDEX idx_maintenance_logs_task ON maintenance_logs (task_id);
  `);

  for (const [index, type] of PARAMETER_TYPES.entries()) {
    await db.runAsync(
      'INSERT INTO parameter_types (id, name, unit, decimals, sort_order) VALUES (?, ?, ?, ?, ?)',
      type.id,
      type.name,
      type.unit,
      type.decimals,
      index,
    );
  }

  for (const reference of PARAMETER_REFERENCES) {
    await db.runAsync(
      `INSERT INTO parameter_references
         (parameter_type_id, aquarium_type, min_value, max_value, reference_description)
       VALUES (?, ?, ?, ?, ?)`,
      reference.parameterId,
      reference.aquariumType,
      reference.min,
      reference.max,
      reference.description,
    );
  }
}
