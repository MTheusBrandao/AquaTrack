import { useSQLiteContext } from 'expo-sqlite';
import { Download, Upload } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { AppText, Button, Card } from '@/components/ui';
import { colors, sizes, spacing } from '@/theme';
import { formatDateTime } from '@/utils/format';

import type { BackupFile } from '../schemas/backupSchema';
import { pickBackupText, shareBackupFile } from '../services/backupFiles';
import { BackupError, backupService, summarizeBackup } from '../services/backupService';

type BackupCardProps = {
  /** Chamado depois de uma restauração, para a tela recarregar seus dados. */
  onRestored: () => void;
};

export function BackupCard({ onRestored }: BackupCardProps) {
  const db = useSQLiteContext();
  const [busy, setBusy] = useState<'export' | 'restore' | null>(null);

  async function handleExport() {
    setBusy('export');
    try {
      await shareBackupFile(await backupService.createBackup(db));
    } catch (error) {
      console.error(error);
      Alert.alert('Não foi possível exportar', 'Tente novamente em instantes.');
    } finally {
      setBusy(null);
    }
  }

  async function restore(backup: BackupFile) {
    setBusy('restore');
    try {
      await backupService.restore(db, backup);
      onRestored();
      Alert.alert('Backup restaurado', 'Seus dados foram substituídos pelos do backup.');
    } catch (error) {
      console.error(error);
      Alert.alert(
        'Não foi possível restaurar',
        error instanceof BackupError ? error.message : 'Tente novamente em instantes.',
      );
    } finally {
      setBusy(null);
    }
  }

  async function handlePick() {
    let backup: BackupFile;
    try {
      const text = await pickBackupText();
      if (text === null) return;
      backup = backupService.parse(text);
    } catch (error) {
      Alert.alert(
        'Arquivo inválido',
        error instanceof BackupError ? error.message : 'Não foi possível ler o arquivo.',
      );
      return;
    }

    const summary = summarizeBackup(backup);
    Alert.alert(
      'Restaurar backup?',
      `Backup de ${formatDateTime(summary.exportedAt)}: ${summary.aquariums} aquário(s), ` +
        `${summary.organisms} organismo(s), ${summary.measurements} medição(ões) e ${summary.tasks} tarefa(s).\n\n` +
        'Todos os dados atuais deste aparelho serão substituídos. Isso não pode ser desfeito.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Substituir dados', style: 'destructive', onPress: () => restore(backup) },
      ],
    );
  }

  return (
    <Card style={styles.card}>
      <AppText variant="subtitle">Backup</AppText>
      <AppText color="textSecondary">
        Os dados ficam só neste aparelho. Exporte um backup para guardar em Arquivos, iCloud Drive ou enviar para
        você mesmo, e restaure quando trocar de celular ou reinstalar o app.
      </AppText>
      <AppText variant="caption" color="textSecondary">
        As fotos dos aquários não entram no backup.
      </AppText>
      <View style={styles.actions}>
        <Button
          label="Exportar backup"
          variant="secondary"
          loading={busy === 'export'}
          disabled={busy !== null}
          icon={<Upload size={sizes.iconSm} color={colors.primary} />}
          onPress={handleExport}
        />
        <Button
          label="Restaurar backup"
          variant="secondary"
          loading={busy === 'restore'}
          disabled={busy !== null}
          icon={<Download size={sizes.iconSm} color={colors.primary} />}
          onPress={handlePick}
        />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.md,
  },
  actions: {
    gap: spacing.sm,
  },
});
