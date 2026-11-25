import type { SQLiteDatabase } from 'expo-sqlite';

/**
 * Marca aquários de demonstração. Todos os dados de exemplo pendem de um aquário marcado,
 * então removê-los é apagar esses aquários (o resto sai em cascata).
 */
export async function up(db: SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    ALTER TABLE aquariums ADD COLUMN is_demo INTEGER NOT NULL DEFAULT 0 CHECK (is_demo IN (0, 1));
  `);
}
