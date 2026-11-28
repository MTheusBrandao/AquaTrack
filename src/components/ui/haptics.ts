import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

/** Toque leve para seleção (chips, segmentos). Silencioso onde não há suporte. */
export function selectionFeedback() {
  if (Platform.OS === 'web') return;
  Haptics.selectionAsync().catch(() => {});
}

/** Confirmação de ação principal (salvar, concluir tarefa). */
export function successFeedback() {
  if (Platform.OS === 'web') return;
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
}
