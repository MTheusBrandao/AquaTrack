import { useState, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { TextField } from '@/components/forms';
import { AppText, Card } from '@/components/ui';
import { colors, radius, spacing } from '@/theme';
import { parseDecimal } from '@/utils/format';

/** Texto do campo + número interpretado (null enquanto vazio ou inválido). */
export function useNumberInput(initial = '') {
  const [text, setText] = useState(initial);
  const parsed = parseDecimal(text);
  return { text, setText, value: Number.isFinite(parsed) ? parsed : null };
}

type NumberFieldProps = {
  label: string;
  suffix?: string;
  input: ReturnType<typeof useNumberInput>;
  placeholder?: string;
};

export function NumberField({ label, suffix, input, placeholder }: NumberFieldProps) {
  const invalid = input.text.trim() !== '' && input.value === null;
  return (
    <TextField
      label={label}
      suffix={suffix}
      keyboardType="decimal-pad"
      value={input.text}
      onChangeText={input.setText}
      placeholder={placeholder}
      error={invalid ? 'Número inválido.' : undefined}
    />
  );
}

export function Result({ label, value }: { label: string; value: string | null }) {
  return (
    <View style={styles.result} accessibilityLiveRegion="polite">
      <AppText variant="caption" color="textSecondary">
        {label}
      </AppText>
      <AppText variant="metric" color={value ? 'primary' : 'textSecondary'}>
        {value ?? '—'}
      </AppText>
    </View>
  );
}

export function CalculatorCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <AppText variant="subtitle">{title}</AppText>
        {description ? (
          <AppText variant="caption" color="textSecondary">
            {description}
          </AppText>
        ) : null}
      </View>
      {children}
    </Card>
  );
}

export function Row({ children }: { children: ReactNode }) {
  return <View style={styles.row}>{children}</View>;
}

export function Cell({ children }: { children: ReactNode }) {
  return <View style={styles.cell}>{children}</View>;
}

/** Número formatado em pt-BR, ou null se não houver resultado. */
export function fmt(value: number | null, decimals = 1, unit = ''): string | null {
  if (value === null || !Number.isFinite(value)) return null;
  const text = value.toLocaleString('pt-BR', { maximumFractionDigits: decimals });
  return unit ? `${text} ${unit}` : text;
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.md,
  },
  header: {
    gap: spacing.xxs,
  },
  result: {
    backgroundColor: colors.primaryMuted,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.xxs,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  cell: {
    flex: 1,
  },
});
