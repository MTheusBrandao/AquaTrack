import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { MAINTENANCE_CATEGORY_LABELS, type MaintenanceTask } from '../types/maintenance';

const ANDROID_CHANNEL_ID = 'maintenance';

/** Chamado uma vez na inicialização do app. */
export function configureNotifications(): void {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
      name: 'Lembretes de manutenção',
      importance: Notifications.AndroidImportance.DEFAULT,
    }).catch((error: unknown) => console.warn('Falha ao criar canal de notificações', error));
  }
}

/** Pede permissão só quando o usuário realmente cria um lembrete. */
export async function ensureNotificationPermission(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  if (!current.canAskAgain) return false;
  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

type ReminderTask = Pick<
  MaintenanceTask,
  'title' | 'category' | 'aquariumName' | 'scheduledAt' | 'completedAt' | 'reminderEnabled'
>;

/**
 * Agenda a notificação da próxima execução. Retorna o id ou null quando não há o que agendar
 * (lembrete desligado, tarefa concluída, horário já passou ou permissão negada).
 * Falhas de notificação nunca devem impedir salvar a tarefa.
 */
export async function scheduleReminder(task: ReminderTask): Promise<string | null> {
  const date = new Date(task.scheduledAt);
  if (!task.reminderEnabled || task.completedAt || date.getTime() <= Date.now()) return null;

  try {
    const granted = await ensureNotificationPermission();
    if (!granted) return null;
    return await Notifications.scheduleNotificationAsync({
      content: {
        title: task.title,
        body: `${task.aquariumName} · ${MAINTENANCE_CATEGORY_LABELS[task.category]}`,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date,
        channelId: Platform.OS === 'android' ? ANDROID_CHANNEL_ID : undefined,
      },
    });
  } catch (error) {
    console.warn('Não foi possível agendar o lembrete', error);
    return null;
  }
}

export async function cancelReminder(notificationId: string | null): Promise<void> {
  if (!notificationId) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch (error) {
    console.warn('Não foi possível cancelar o lembrete', error);
  }
}
