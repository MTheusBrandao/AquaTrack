import type { SQLiteDatabase } from 'expo-sqlite';

import { backupRepository } from '@/database/repositories/backupRepository';
import { migrations } from '@/database/migrations';
import { deleteStoredImage } from '@/features/aquariums/services/aquariumImageStorage';
import { maintenanceService } from '@/features/maintenance/services/maintenanceService';
import { cancelReminder } from '@/features/maintenance/services/reminderScheduler';

import { BACKUP_APP_ID, backupFileSchema, type BackupFile } from '../schemas/backupSchema';

const CURRENT_SCHEMA_VERSION = migrations[migrations.length - 1].version;
/** O backup surgiu no schema 3. Migrations futuras devem só acrescentar colunas com padrão. */
const MIN_SUPPORTED_SCHEMA_VERSION = 3;

/** Erro com mensagem pronta para o usuário. */
export class BackupError extends Error {}

export type BackupSummary = {
  aquariums: number;
  organisms: number;
  measurements: number;
  tasks: number;
  exportedAt: string;
};

export function summarizeBackup(backup: BackupFile): BackupSummary {
  return {
    aquariums: backup.data.aquariums.length,
    organisms: backup.data.aquarium_species.length,
    measurements: backup.data.parameter_records.length,
    tasks: backup.data.maintenance_tasks.length,
    exportedAt: backup.exportedAt,
  };
}

export const backupService = {
  async createBackup(db: SQLiteDatabase): Promise<BackupFile> {
    return {
      app: BACKUP_APP_ID,
      schemaVersion: await backupRepository.getSchemaVersion(db),
      exportedAt: new Date().toISOString(),
      data: await backupRepository.exportAll(db),
    };
  },

  /** Valida o conteúdo de um arquivo de backup. Lança BackupError com mensagem amigável. */
  parse(text: string): BackupFile {
    let json: unknown;
    try {
      json = JSON.parse(text);
    } catch {
      throw new BackupError('O arquivo não é um JSON válido.');
    }

    const result = backupFileSchema.safeParse(json);
    if (!result.success) {
      const appIssue = result.error.issues.find((issue) => issue.path[0] === 'app');
      throw new BackupError(appIssue?.message ?? 'O arquivo de backup está incompleto ou corrompido.');
    }
    if (result.data.schemaVersion > CURRENT_SCHEMA_VERSION) {
      throw new BackupError('Este backup foi feito por uma versão mais nova do app. Atualize o AquaTrack.');
    }
    if (result.data.schemaVersion < MIN_SUPPORTED_SCHEMA_VERSION) {
      throw new BackupError('Este backup é de uma versão antiga do app e não pode ser restaurado.');
    }
    return result.data as BackupFile;
  },

  /**
   * Substitui todos os dados do aparelho pelos do backup, numa única transação:
   * se qualquer registro for inválido, nada é alterado.
   * Fotos não fazem parte do backup; lembretes são reagendados no aparelho.
   */
  async restore(db: SQLiteDatabase, backup: BackupFile): Promise<void> {
    const oldImages = await backupRepository.listImagePaths(db);
    const oldNotifications = await backupRepository.listNotificationIds(db);

    try {
      await db.withTransactionAsync(async () => {
        await backupRepository.clearUserData(db);
        await backupRepository.insertAll(db, backup.data);
      });
    } catch (error) {
      console.error(error);
      throw new BackupError('O backup contém dados inválidos. Nada foi alterado.');
    }

    await Promise.all(oldNotifications.map((id) => cancelReminder(id)));
    oldImages.forEach(deleteStoredImage);
    await maintenanceService.rescheduleAllReminders(db);
  },
};
