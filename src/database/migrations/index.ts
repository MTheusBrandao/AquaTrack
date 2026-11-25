import type { SQLiteDatabase } from 'expo-sqlite';

import * as initial from './001_initial';

type Migration = {
  version: number;
  up: (db: SQLiteDatabase) => Promise<void>;
};

/**
 * Lista ordenada de migrations. Para evoluir o schema, adicione uma nova entrada
 * com a próxima versão; nunca edite uma migration já distribuída.
 */
export const migrations: Migration[] = [{ version: 1, up: initial.up }];
