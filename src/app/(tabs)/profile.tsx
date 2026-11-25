import Constants from 'expo-constants';
import { StyleSheet, View } from 'react-native';

import { AppText, Card, Screen } from '@/components/ui';
import { colors, spacing } from '@/theme';

export default function ProfileScreen() {
  const version = Constants.expoConfig?.version ?? '—';

  return (
    <Screen title="Perfil" subtitle="Configurações e preferências">
      <Card style={styles.card}>
        <AppText variant="subtitle">Sobre o AquaTrack</AppText>
        <AppText color="textSecondary">
          Gerenciamento e monitoramento de aquários. Os dados ficam salvos apenas neste aparelho.
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
    gap: spacing.sm,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginVertical: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
