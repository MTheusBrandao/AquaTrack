import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { CalendarDays, X } from 'lucide-react-native';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui';
import { borderWidth, colors, radius, sizes, spacing } from '@/theme';
import { formatLocalDate, parseLocalDate, toLocalDateString } from '@/utils/format';

type DateFieldProps = {
  /** YYYY-MM-DD ou null quando não informado. */
  value: string | null;
  onChange: (value: string | null) => void;
  label: string;
  placeholder?: string;
  hasError?: boolean;
};

export function DateField({ value, onChange, label, placeholder, hasError }: DateFieldProps) {
  const [iosPickerVisible, setIosPickerVisible] = useState(false);
  const date = value ? parseLocalDate(value) : new Date();
  const maximumDate = new Date();

  function handlePress() {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: date,
        mode: 'date',
        maximumDate,
        onValueChange: (_event, selected) => onChange(toLocalDateString(selected)),
      });
      return;
    }
    if (!value) onChange(toLocalDateString(date));
    setIosPickerVisible((visible) => !visible);
  }

  function handleClear() {
    setIosPickerVisible(false);
    onChange(null);
  }

  return (
    <View style={styles.container}>
      <View style={[styles.row, hasError && styles.error]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${label}: ${value ? formatLocalDate(value) : 'não informada'}`}
          onPress={handlePress}
          style={styles.trigger}>
          <CalendarDays size={sizes.iconSm} color={colors.primary} />
          <AppText color={value ? 'textPrimary' : 'textSecondary'}>
            {value ? formatLocalDate(value) : (placeholder ?? 'Selecionar data')}
          </AppText>
        </Pressable>
        {value ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Limpar ${label}`}
            hitSlop={spacing.sm}
            onPress={handleClear}>
            <X size={sizes.iconSm} color={colors.textSecondary} />
          </Pressable>
        ) : null}
      </View>
      {Platform.OS === 'ios' && iosPickerVisible ? (
        <DateTimePicker
          value={date}
          mode="date"
          display="inline"
          locale="pt-BR"
          maximumDate={maximumDate}
          accentColor={colors.primary}
          onValueChange={(_event, selected) => onChange(toLocalDateString(selected))}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: sizes.inputHeight,
    borderRadius: radius.md,
    borderWidth: borderWidth.hairline,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
  },
  error: {
    borderColor: colors.critical,
  },
  trigger: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
});
