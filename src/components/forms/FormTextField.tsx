import { useController, type Control, type FieldValues, type Path } from 'react-hook-form';
import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { AppText } from '@/components/ui';
import { borderWidth, colors, radius, sizes, spacing, typography } from '@/theme';

import { Field } from './Field';

type FormTextFieldProps<T extends FieldValues, TOut extends FieldValues> = Omit<
  TextInputProps,
  'value' | 'onChangeText' | 'onBlur'
> & {
  control: Control<T, unknown, TOut>;
  name: Path<T>;
  label: string;
  optional?: boolean;
  hint?: string;
  /** Unidade exibida à direita do campo, ex.: "L", "cm", "°C". */
  suffix?: string;
};

export function FormTextField<T extends FieldValues, TOut extends FieldValues>({
  control,
  name,
  label,
  optional,
  hint,
  suffix,
  multiline,
  ...inputProps
}: FormTextFieldProps<T, TOut>) {
  const { field, fieldState } = useController({ control, name });
  const hasError = Boolean(fieldState.error);

  return (
    <Field label={label} optional={optional} hint={hint} error={fieldState.error?.message}>
      <View style={[styles.inputWrapper, multiline && styles.multiline, hasError && styles.error]}>
        <TextInput
          accessibilityLabel={label}
          placeholderTextColor={colors.textSecondary}
          style={[styles.input, multiline && styles.multilineInput]}
          value={field.value}
          onChangeText={field.onChange}
          onBlur={field.onBlur}
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
