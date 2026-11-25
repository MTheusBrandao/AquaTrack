import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui';
import { spacing } from '@/theme';

type FieldProps = {
  label: string;
  optional?: boolean;
  hint?: string;
  error?: string;
  children: ReactNode;
};

/** Rótulo, dica e mensagem de erro padronizados para qualquer controle de formulário. */
export function Field({ label, optional, hint, error, children }: FieldProps) {
  return (
    <View style={styles.field}>
      <AppText variant="label">
        {label}
        {optional ? <AppText variant="caption" color="textSecondary"> (opcional)</AppText> : null}
      </AppText>
      {children}
      {error ? (
        <AppText variant="caption" color="critical" accessibilityLiveRegion="polite">
          {error}
        </AppText>
      ) : hint ? (
        <AppText variant="caption" color="textSecondary">
          {hint}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: spacing.xs + spacing.xxs,
  },
});
