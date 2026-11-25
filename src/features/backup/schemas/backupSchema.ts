import { z } from 'zod';

import { BACKUP_TABLES, type BackupData, type BackupTableName } from '@/database/repositories/backupRepository';

export const BACKUP_APP_ID = 'aquatrack';

const value = z.union([z.string(), z.number(), z.null()]);
const row = z.record(z.string(), value).refine((item) => typeof item.id === 'string', 'Registro sem id.');

const dataShape = Object.fromEntries(
  BACKUP_TABLES.map((table) => [table.name, z.array(row)]),
) as Record<BackupTableName, z.ZodArray<typeof row>>;

/**
 * Estrutura do arquivo. Aqui só se valida o formato; as regras de negócio (tipos válidos,
 * volume positivo, chaves estrangeiras) são garantidas pelas constraints do SQLite,
 * e qualquer violação desfaz a restauração inteira.
 */
export const backupFileSchema = z.object({
  app: z.literal(BACKUP_APP_ID, 'Este arquivo não é um backup do AquaTrack.'),
  schemaVersion: z.number().int().positive(),
  exportedAt: z.string(),
  data: z.object(dataShape),
});

export type BackupFile = {
  app: typeof BACKUP_APP_ID;
  schemaVersion: number;
  exportedAt: string;
  data: BackupData;
};
