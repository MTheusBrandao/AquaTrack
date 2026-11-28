import type { SQLiteDatabase } from 'expo-sqlite';

/**
 * Foto opcional de cada organismo do aquário. Assim como a do aquário, guarda só o caminho
 * relativo ao diretório de documentos e não viaja no backup.
 */
export async function up(db: SQLiteDatabase): Promise<void> {
  await db.execAsync('ALTER TABLE aquarium_species ADD COLUMN image_uri TEXT;');
}
