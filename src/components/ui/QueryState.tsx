import { CircleAlert } from 'lucide-react-native';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { colors, spacing } from '@/theme';

import { Button } from './Button';
import { EmptyState } from './EmptyState';

export function LoadingState() {
  return (
    <View style={styles.loading} accessibilityLabel="Carregando">
      <ActivityIndicator color={colors.primary} />
    </View>
  );
}

type ErrorStateProps = {
  message?: string;
  onRetry?: () => void;
};

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <EmptyState
      icon={CircleAlert}
      title="Algo deu errado"
      description={message ?? 'Não foi possível carregar os dados.'}
      action={
        onRetry ? <Button label="Tentar novamente" variant="secondary" onPress={onRetry} /> : null
      }
    />
  );
}

const styles = StyleSheet.create({
  loading: {
    paddingVertical: spacing.xxxl,
    alignItems: 'center',
  },
});
