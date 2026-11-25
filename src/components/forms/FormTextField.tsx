import { useController, type Control, type FieldValues, type Path } from 'react-hook-form';

import { TextField, type TextFieldProps } from './TextField';

type FormTextFieldProps<T extends FieldValues, TOut extends FieldValues> = Omit<
  TextFieldProps,
  'value' | 'onChangeText' | 'onBlur' | 'error'
> & {
  control: Control<T, unknown, TOut>;
  name: Path<T>;
};

/** TextField ligado ao React Hook Form (valor, blur e mensagem de erro). */
export function FormTextField<T extends FieldValues, TOut extends FieldValues>({
  control,
  name,
  ...fieldProps
}: FormTextFieldProps<T, TOut>) {
  const { field, fieldState } = useController({ control, name });

  return (
    <TextField
      {...fieldProps}
      value={field.value}
      onChangeText={field.onChange}
      onBlur={field.onBlur}
      error={fieldState.error?.message}
    />
  );
}
