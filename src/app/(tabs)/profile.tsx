import Constants from 'expo-constants';
import { useSQLiteContext } from 'expo-sqlite';
import { FlaskConical, Trash2 } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { AppText, Button, Card, Screen } from '@/components/ui';
import { BackupCard } from '@/features/backup/components/BackupCard';
import { demoDataService } from '@/features/demo/services/demoDataService';
import { useFocusQuery } from '@/hooks/useFocusQuery';
import { colors, sizes, spacing } from '@/theme';

export default function ProfileScreen() {
  const db = useSQLiteContext();
  const version = Constants.expoConfig?.version ?? '—';
  const demo = useFocusQuery(demoDataService.hasDemoData);
  const [busy, setBusy] = useState(false);

  async function run(action: () => Promise<void>, successMessage: string) {
    setBusy(true);
    try {
      await action();
      demo.reload();
      Alert.alert('Pronto', successMessage);
    } catch (cause) {
      console.error(cause);
      Alert.alert('Algo deu errado', 'Tente novamente em instantes.');
    } finally {
      setBusy(false);
    }
  }

  function confirmRemoveDemo() {
    Alert.alert(
      'Remover dados de exemplo?',
      'Os aquários marcados como “Exemplo” e tudo ligado a eles serão excluídos. Seus próprios dados não são afetados.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: () => run(() => demoDataService.remove(db), 'Os dados de exemplo foram removidos.'),
        },
      ],
    );
  }

  return (
    <Screen title="Perfil" subtitle="Configurações e preferências">
      <BackupCard onRestored={demo.reload} />

      <Card style={styles.card}>
        <AppText variant="subtitle">Dados de exemplo</AppText>
        <AppText color="textSecondary">
          Dois aquários fictícios, marcados como “Exemplo”, com organismos, um mês de medições e manutenções. Úteis
          para conhecer o app ou apresentá-lo, e podem ser removidos a qualquer momento sem afetar seus dados.
        </AppText>
        {demo.data ? (
          <Button
            label="Remover dados de exemplo"
            variant="danger"
            loading={busy}
            icon={<Trash2 size={sizes.iconSm} color={colors.critical} />}
            onPress={confirmRemoveDemo}
          />
        ) : (
          <Button
            label="Carregar dados de exemplo"
            variant="secondary"
            loading={busy}
            disabled={demo.loading}
            icon={<FlaskConical size={sizes.iconSm} color={colors.primary} />}
            onPress={() =>
              run(() => demoDataService.load(db), 'Os aquários de exemplo foram adicionados. Veja a aba Início.')
            }
          />
        )}
      </Card>

      <Card style={styles.card}>
        <AppText variant="subtitle">Sobre o AquaTrack</AppText>
        <AppText color="textSecondary">
          Gerenciamento e monitoramento de aquários. Os dados ficam salvos apenas neste aparelho.
        </AppText>
        <AppText variant="caption" color="textSecondary">
          As faixas de parâmetros são referências gerais por tipo de água e não substituem a orientação para cada
          espécie.
        </AppText>
        <View style={styles.divider} />
        <View style={styles.row}>
          <AppText color="textSecondary">Versão</AppText>
          <AppText variant="label">{version}</AppText>
        </View>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.md,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
