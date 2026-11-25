import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { AppText } from '@/components/ui';
import { borderWidth, colors, radius, sizes, spacing, typography } from '@/theme';

import { Field } from './Field';

export type TextFieldProps = TextInputProps & {
  label: string;
  optional?: boolean;
  hint?: string;
  error?: string;
  /** Unidade exibida à direita do campo, ex.: "L", "cm", "°C". */
  suffix?: string;
};

/** Campo de texto com rótulo, unidade, dica e erro, no visual do design system. */
export function TextField({ label, optional, hint, error, suffix, multiline, style, ...inputProps }: TextFieldProps) {
  return (
    <Field label={label} optional={optional} hint={hint} error={error}>
      <View style={[styles.inputWrapper, multiline && styles.multiline, error ? styles.error : null]}>
        <TextInput
          accessibilityLabel={label}
          placeholderTextColor={colors.textSecondary}
          style={[styles.input, multiline && styles.multilineInput, style]}
          multiline={multiline}
          {...inputProps}
        />
        {suffix ? (
          <AppText color="textSecondary" style={styles.suffix}>
            {suffix}
          </AppText>
        ) : null}
      </View>
    </Field>
  );
}

const styles = StyleSheet.create({
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: sizes.inputHeight,
    borderRadius: radius.md,
    borderWidth: borderWidth.hairline,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
  },
  multiline: {
    alignItems: 'flex-start',
    paddingVertical: spacing.sm,
  },
  error: {
    borderColor: colors.critical,
  },
  input: {
    flex: 1,
    ...typography.body,
    color: colors.textPrimary,
    paddingVertical: spacing.sm,
  },
  multilineInput: {
    minHeight: sizes.inputHeight * 2,
    textAlignVertical: 'top',
  },
  suffix: {
    marginLeft: spacing.sm,
  },
});
