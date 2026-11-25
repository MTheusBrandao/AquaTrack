import type { SQLiteDatabase } from 'expo-sqlite';

import type {
  Frequency,
  MaintenanceCategory,
  MaintenanceInput,
  MaintenanceLog,
  MaintenanceTask,
} from '@/features/maintenance/types/maintenance';

type TaskRow = {
  id: string;
  aquarium_id: string;
  aquarium_name: string;
  title: string;
  category: MaintenanceCategory;
  description: string | null;
  frequency: Frequency;
  starts_at: string;
  scheduled_at: string;
  completed_at: string | null;
  reminder_enabled: number;
  notification_id: string | null;
  equipment_id: string | null;
  equipment_name: string | null;
};

type LogRow = {
  id: string;
  task_id: string | null;
  aquarium_id: string;
  aquarium_name: string;
  title: string;
  category: MaintenanceCategory;
  scheduled_for: string;
  completed_at: string;
};

function toTask(row: TaskRow): MaintenanceTask {
  return {
    id: row.id,
    aquariumId: row.aquarium_id,
    aquariumName: row.aquarium_name,
    title: row.title,
    category: row.category,
    description: row.description,
    frequency: row.frequency,
    startsAt: row.starts_at,
    scheduledAt: row.scheduled_at,
    completedAt: row.completed_at,
    reminderEnabled: row.reminder_enabled === 1,
    notificationId: row.notification_id,
    equipmentId: row.equipment_id,
    equipmentName: row.equipment_name,
  };
}

function toLog(row: LogRow): MaintenanceLog {
  return {
    id: row.id,
    taskId: row.task_id,
    aquariumId: row.aquarium_id,
    aquariumName: row.aquarium_name,
    title: row.title,
    category: row.category,
    scheduledFor: row.scheduled_for,
    completedAt: row.completed_at,
  };
}

const TASK_SELECT = `
  SELECT t.*, a.name AS aquarium_name, e.name AS equipment_name
  FROM maintenance_tasks t
  JOIN aquariums a ON a.id = t.aquarium_id
  LEFT JOIN equipment e ON e.id = t.equipment_id`;

export const maintenanceRepository = {
  /** Tarefas ainda não concluídas, da mais próxima para a mais distante. */
  async listOpen(db: SQLiteDatabase, aquariumId: string | null): Promise<MaintenanceTask[]> {
    const rows = await db.getAllAsync<TaskRow>(
      `${TASK_SELECT}
       WHERE t.completed_at IS NULL AND (? IS NULL OR t.aquarium_id = ?)
       ORDER BY t.scheduled_at ASC`,
      aquariumId,
      aquariumId,
    );
    return rows.map(toTask);
  },

  async findById(db: SQLiteDatabase, id: string): Promise<MaintenanceTask | null> {
    const row = await db.getFirstAsync<TaskRow>(`${TASK_SELECT} WHERE t.id = ?`, id);
    return row ? toTask(row) : null;
  },

  async listByEquipment(db: SQLiteDatabase, equipmentId: string): Promise<MaintenanceTask[]> {
    const rows = await db.getAllAsync<TaskRow>(
      `${TASK_SELECT}
       WHERE t.equipment_id = ? AND t.completed_at IS NULL
       ORDER BY t.scheduled_at ASC`,
      equipmentId,
    );
    return rows.map(toTask);
  },

  async listNotificationIds(db: SQLiteDatabase, aquariumId: string): Promise<string[]> {
    const rows = await db.getAllAsync<{ notification_id: string }>(
      'SELECT notification_id FROM maintenance_tasks WHERE aquarium_id = ? AND notification_id IS NOT NULL',
      aquariumId,
    );
    return rows.map((row) => row.notification_id);
  },

  async insert(db: SQLiteDatabase, id: string, input: MaintenanceInput, now: string): Promise<void> {
    await db.runAsync(
      `INSERT INTO maintenance_tasks (
         id, aquarium_id, title, category, description, frequency, starts_at, scheduled_at,
         reminder_enabled, equipment_id, created_at, updated_at
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      id,
      input.aquariumId,
      input.title,
      input.category,
      input.description,
      input.frequency,
      input.scheduledAt,
      input.scheduledAt,
      input.reminderEnabled ? 1 : 0,
      input.equipmentId ?? null,
      now,
      now,
    );
  },

  async update(db: SQLiteDatabase, id: string, input: MaintenanceInput, now: string): Promise<void> {
    await db.runAsync(
      `UPDATE maintenance_tasks SET
         aquarium_id = ?, title = ?, category = ?, description = ?, frequency = ?,
         starts_at = ?, scheduled_at = ?, reminder_enabled = ?, equipment_id = ?, updated_at = ?
       WHERE id = ?`,
      input.aquariumId,
      input.title,
      input.category,
      input.description,
      input.frequency,
      input.scheduledAt,
      input.scheduledAt,
      input.reminderEnabled ? 1 : 0,
      input.equipmentId ?? null,
      now,
      id,
    );
  },

  async setNotificationId(db: SQLiteDatabase, id: string, notificationId: string | null): Promise<void> {
    await db.runAsync('UPDATE maintenance_tasks SET notification_id = ? WHERE id = ?', notificationId, id);
  },

  async reschedule(db: SQLiteDatabase, id: string, scheduledAt: string, now: string): Promise<void> {
    await db.runAsync(
      'UPDATE maintenance_tasks SET scheduled_at = ?, updated_at = ? WHERE id = ?',
      scheduledAt,
      now,
      id,
    );
  },

  async markCompleted(db: SQLiteDatabase, id: string, completedAt: string): Promise<void> {
    await db.runAsync(
      'UPDATE maintenance_tasks SET completed_at = ?, updated_at = ? WHERE id = ?',
      completedAt,
      completedAt,
      id,
    );
  },

  async remove(db: SQLiteDatabase, id: string): Promise<void> {
    await db.runAsync('DELETE FROM maintenance_tasks WHERE id = ?', id);
  },

  async insertLog(db: SQLiteDatabase, log: Omit<MaintenanceLog, 'aquariumName'>): Promise<void> {
    await db.runAsync(
      `INSERT INTO maintenance_logs (id, task_id, aquarium_id, title, category, scheduled_for, completed_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      log.id,
      log.taskId,
      log.aquariumId,
      log.title,
      log.category,
      log.scheduledFor,
      log.completedAt,
    );
  },

  async listLogs(
    db: SQLiteDatabase,
    filter: { taskId?: string; limit: number },
  ): Promise<MaintenanceLog[]> {
    const taskId = filter.taskId ?? null;
    const rows = await db.getAllAsync<LogRow>(
      `SELECT l.*, a.name AS aquarium_name
       FROM maintenance_logs l
       JOIN aquariums a ON a.id = l.aquarium_id
       WHERE (? IS NULL OR l.task_id = ?)
       ORDER BY l.completed_at DESC
       LIMIT ?`,
      taskId,
      taskId,
      filter.limit,
    );
    return rows.map(toLog);
  },
};
