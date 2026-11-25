import type { SQLiteDatabase } from 'expo-sqlite';

import { migrations } from './migrations';

export const DATABASE_NAME = 'aquatrack.db';

/**
 * Executado pelo SQLiteProvider ao abrir o banco.
 * A versão do schema fica em `PRAGMA user_version`; cada migration roda numa transação.
 */
export async function initializeDatabase(db: SQLiteDatabase): Promise<void> {
  await db.execAsync('PRAGMA journal_mode = WAL;');
  // foreign_keys vale por conexão e vem desligado por padrão no SQLite.
  await db.execAsync('PRAGMA foreign_keys = ON;');

  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  const currentVersion = row?.user_version ?? 0;

  for (const migration of migrations) {
    if (migration.version <= currentVersion) continue;

    await db.withTransactionAsync(async () => {
      await migration.up(db);
      // PRAGMA não aceita parâmetros; a versão vem do código, nunca do usuário.
      await db.execAsync(`PRAGMA user_version = ${migration.version}`);
    });
  }
}
