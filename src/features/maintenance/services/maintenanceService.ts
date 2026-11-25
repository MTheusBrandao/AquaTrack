import type { SQLiteDatabase } from 'expo-sqlite';

import { maintenanceRepository } from '@/database/repositories/maintenanceRepository';
import { createId } from '@/utils/id';

import type { MaintenanceInput, MaintenanceLog, MaintenanceTask } from '../types/maintenance';
import { nextAfterCompletion } from '../utils/recurrence';
import { cancelReminder, scheduleReminder } from './reminderScheduler';

export type MaintenanceDetails = {
  task: MaintenanceTask;
  logs: MaintenanceLog[];
};

export type MaintenanceOverview = {
  open: MaintenanceTask[];
  recentLogs: MaintenanceLog[];
};

/** (Re)agenda o lembrete da tarefa e grava o id da notificação. */
async function syncReminder(db: SQLiteDatabase, taskId: string): Promise<void> {
  const task = await maintenanceRepository.findById(db, taskId);
  if (!task) return;
  await cancelReminder(task.notificationId);
  const notificationId = await scheduleReminder(task);
  await maintenanceRepository.setNotificationId(db, taskId, notificationId);
}

export const maintenanceService = {
  async getOverview(db: SQLiteDatabase): Promise<MaintenanceOverview> {
    const [open, recentLogs] = await Promise.all([
      maintenanceRepository.listOpen(db, null),
      maintenanceRepository.listLogs(db, { limit: 10 }),
    ]);
    return { open, recentLogs };
  },

  listOpenForAquarium(db: SQLiteDatabase, aquariumId: string): Promise<MaintenanceTask[]> {
    return maintenanceRepository.listOpen(db, aquariumId);
  },

  async getDetails(db: SQLiteDatabase, id: string): Promise<MaintenanceDetails | null> {
    const task = await maintenanceRepository.findById(db, id);
    if (!task) return null;
    const logs = await maintenanceRepository.listLogs(db, { taskId: id, limit: 20 });
    return { task, logs };
  },

  get(db: SQLiteDatabase, id: string): Promise<MaintenanceTask | null> {
    return maintenanceRepository.findById(db, id);
  },

  async create(db: SQLiteDatabase, input: MaintenanceInput): Promise<string> {
    const id = createId();
    await maintenanceRepository.insert(db, id, input, new Date().toISOString());
    await syncReminder(db, id);
    return id;
  },

  /** Editar a data redefine a âncora da recorrência. */
  async update(db: SQLiteDatabase, id: string, input: MaintenanceInput): Promise<void> {
    await maintenanceRepository.update(db, id, input, new Date().toISOString());
    await syncReminder(db, id);
  },

  /**
   * Registra a conclusão no histórico. Tarefa única é marcada como concluída;
   * recorrente avança para a próxima ocorrência do calendário.
   */
  async complete(db: SQLiteDatabase, id: string, completedAt = new Date()): Promise<void> {
    const task = await maintenanceRepository.findById(db, id);
    if (!task || task.completedAt) return;

    const completedIso = completedAt.toISOString();
    await db.withTransactionAsync(async () => {
      await maintenanceRepository.insertLog(db, {
        id: createId(),
        taskId: task.id,
        aquariumId: task.aquariumId,
        title: task.title,
        category: task.category,
        scheduledFor: task.scheduledAt,
        completedAt: completedIso,
      });

      if (task.frequency === 'once') {
        await maintenanceRepository.markCompleted(db, task.id, completedIso);
      } else {
        const next = nextAfterCompletion(
          new Date(task.startsAt),
          task.frequency,
          new Date(task.scheduledAt),
          completedAt,
        );
        await maintenanceRepository.reschedule(db, task.id, next.toISOString(), completedIso);
      }
    });

    await syncReminder(db, task.id);
  },

  async remove(db: SQLiteDatabase, id: string): Promise<void> {
    const task = await maintenanceRepository.findById(db, id);
    if (!task) return;
    await cancelReminder(task.notificationId);
    await maintenanceRepository.remove(db, id);
  },

  /** Agenda os lembretes de todas as tarefas abertas (ex.: depois de restaurar um backup). */
  async rescheduleAllReminders(db: SQLiteDatabase): Promise<void> {
    const open = await maintenanceRepository.listOpen(db, null);
    for (const task of open) {
      await syncReminder(db, task.id);
    }
  },

  /** Antes de excluir um aquário: as tarefas somem em cascata, mas os lembretes agendados não. */
  async cancelRemindersForAquarium(db: SQLiteDatabase, aquariumId: string): Promise<void> {
    const ids = await maintenanceRepository.listNotificationIds(db, aquariumId);
    await Promise.all(ids.map((notificationId) => cancelReminder(notificationId)));
  },
};
