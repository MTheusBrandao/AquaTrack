import type { SQLiteDatabase } from 'expo-sqlite';

export type BackupValue = string | number | null;
export type BackupRow = Record<string, BackupValue>;

/**
 * Tabelas com dados do usuário, em ordem compatível com as chaves estrangeiras.
 * Catálogo de espécies, tipos de parâmetro e faixas de referência vêm das migrations
 * e não entram no backup. As colunas são uma lista fixa: nomes vindos do arquivo
 * nunca são usados para montar SQL.
 */
export const BACKUP_TABLES = [
  {
    name: 'aquariums',
    columns: [
      'id', 'name', 'type', 'volume', 'length', 'width', 'height', 'setup_date',
      'target_temperature', 'description', 'image_uri', 'is_demo', 'created_at', 'updated_at',
    ],
    where: '1 = 1',
  },
  {
    name: 'species',
    columns: [
      'id', 'common_name', 'scientific_name', 'category', 'water_type', 'description',
      'is_custom', 'created_at',
    ],
    where: 'is_custom = 1',
  },
  {
    name: 'aquarium_species',
    columns: ['id', 'aquarium_id', 'species_id', 'quantity', 'added_at', 'notes', 'created_at'],
    where: '1 = 1',
  },
  {
    name: 'parameter_records',
    columns: ['id', 'aquarium_id', 'parameter_type_id', 'value', 'measured_at', 'notes', 'created_at'],
    where: '1 = 1',
  },
  {
    name: 'equipment',
    columns: [
      'id', 'aquarium_id', 'name', 'category', 'brand', 'model', 'power_watts', 'installed_at',
      'notes', 'created_at', 'updated_at',
    ],
    where: '1 = 1',
    /** Tabela criada no schema 5: backups anteriores não a contêm. */
    addedInSchema: 5,
  },
  {
    name: 'maintenance_tasks',
    columns: [
      'id', 'aquarium_id', 'title', 'category', 'description', 'frequency', 'starts_at',
      'scheduled_at', 'completed_at', 'reminder_enabled', 'notification_id', 'equipment_id',
      'created_at', 'updated_at',
    ],
    where: '1 = 1',
  },
  {
    name: 'maintenance_logs',
    columns: ['id', 'task_id', 'aquarium_id', 'title', 'category', 'scheduled_for', 'completed_at'],
    where: '1 = 1',
  },
] as const;

export type BackupTableName = (typeof BACKUP_TABLES)[number]['name'];
export type BackupData = Record<BackupTableName, BackupRow[]>;

/** Colunas que não fazem sentido em outro aparelho e são zeradas na restauração. */
const DEVICE_SPECIFIC_COLUMNS: Partial<Record<BackupTableName, string[]>> = {
  aquariums: ['image_uri'],
  maintenance_tasks: ['notification_id'],
};

export const backupRepository = {
  async getSchemaVersion(db: SQLiteDatabase): Promise<number> {
    const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
    return row?.user_version ?? 0;
  },

  async exportAll(db: SQLiteDatabase): Promise<BackupData> {
    const data = {} as BackupData;
    for (const table of BACKUP_TABLES) {
      data[table.name] = await db.getAllAsync<BackupRow>(
        `SELECT ${table.columns.join(', ')} FROM ${table.name} WHERE ${table.where}`,
      );
    }
    return data;
  },

  /** Apaga os dados do usuário. Deve rodar dentro de uma transação junto com `insertAll`. */
  async clearUserData(db: SQLiteDatabase): Promise<void> {
    // Organismos, medições, tarefas e histórico saem em cascata com os aquários.
    await db.execAsync(`
      DELETE FROM aquariums;
      DELETE FROM species WHERE is_custom = 1;
    `);
  },

  async insertAll(db: SQLiteDatabase, data: BackupData): Promise<void> {
    for (const table of BACKUP_TABLES) {
      const reset: string[] = DEVICE_SPECIFIC_COLUMNS[table.name] ?? [];

      for (const row of data[table.name]) {
        // Só colunas conhecidas e presentes no registro: as ausentes (backup de versão
        // anterior) recebem o valor padrão do schema atual.
        const columns = table.columns.filter((column) => column in row && !reset.includes(column));
        const placeholders = columns.map(() => '?').join(', ');
        await db.runAsync(
          `INSERT INTO ${table.name} (${columns.join(', ')}) VALUES (${placeholders})`,
          columns.map((column) => row[column] ?? null),
        );
      }
    }
  },

  async listImagePaths(db: SQLiteDatabase): Promise<string[]> {
    const rows = await db.getAllAsync<{ image_uri: string }>(
      'SELECT image_uri FROM aquariums WHERE image_uri IS NOT NULL',
    );
    return rows.map((row) => row.image_uri);
  },

  async listNotificationIds(db: SQLiteDatabase): Promise<string[]> {
    const rows = await db.getAllAsync<{ notification_id: string }>(
      'SELECT notification_id FROM maintenance_tasks WHERE notification_id IS NOT NULL',
    );
    return rows.map((row) => row.notification_id);
  },
};
