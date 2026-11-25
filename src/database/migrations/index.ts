import type { SQLiteDatabase } from 'expo-sqlite';

import * as initial from './001_initial';
import * as monitoringMaintenance from './002_monitoring_maintenance';
import * as demoFlag from './003_demo_flag';

type Migration = {
  version: number;
  up: (db: SQLiteDatabase) => Promise<void>;
};

/**
 * Lista ordenada de migrations. Para evoluir o schema, adicione uma nova entrada
 * com a próxima versão; nunca edite uma migration já distribuída.
 */
export const migrations: Migration[] = [
  { version: 1, up: initial.up },
  { version: 2, up: monitoringMaintenance.up },
  { version: 3, up: demoFlag.up },
];
