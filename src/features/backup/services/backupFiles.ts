import * as DocumentPicker from 'expo-document-picker';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import { toLocalDateString } from '@/utils/format';

import type { BackupFile } from '../schemas/backupSchema';

/** Grava o backup num arquivo temporário e abre a folha de compartilhamento do sistema. */
export async function shareBackupFile(backup: BackupFile): Promise<void> {
  if (!(await Sharing.isAvailableAsync())) {
    throw new Error('Compartilhamento indisponível neste aparelho.');
  }
  const file = new File(Paths.cache, `aquatrack-backup-${toLocalDateString(new Date())}.json`);
  file.create({ overwrite: true });
  await file.write(JSON.stringify(backup));
  await Sharing.shareAsync(file.uri, {
    mimeType: 'application/json',
    UTI: 'public.json',
    dialogTitle: 'Salvar backup do AquaTrack',
  });
}

/** Abre o seletor de arquivos e devolve o texto escolhido, ou null se o usuário cancelar. */
export async function pickBackupText(): Promise<string | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: ['application/json', 'text/plain'],
    copyToCacheDirectory: true,
  });
  if (result.canceled || !result.assets[0]) return null;
  return new File(result.assets[0].uri).text();
}
