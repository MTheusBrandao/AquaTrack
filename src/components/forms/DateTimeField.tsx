import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { CalendarClock } from 'lucide-react-native';
import { Platform, Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui';
import { borderWidth, colors, radius, sizes, spacing } from '@/theme';
import { formatDateTime } from '@/utils/format';

type DateTimeFieldProps = {
  /** Instante ISO 8601. */
  value: string;
  onChange: (value: string) => void;
  label: string;
  minimumDate?: Date;
  maximumDate?: Date;
  hasError?: boolean;
};

/** Data e hora. No iOS usa o seletor compacto nativo; no Android abre data e depois hora. */
export function DateTimeField({
  value,
  onChange,
  label,
  minimumDate,
  maximumDate,
  hasError,
}: DateTimeFieldProps) {
  const date = new Date(value);

  if (Platform.OS === 'ios') {
    return (
      <View style={[styles.row, hasError && styles.error]}>
        <CalendarClock size={sizes.iconSm} color={colors.primary} />
        <View style={styles.flex} />
        <DateTimePicker
          accessibilityLabel={label}
          value={date}
          mode="datetime"
          display="compact"
          locale="pt-BR"
          minimumDate={minimumDate}
          maximumDate={maximumDate}
          accentColor={colors.primary}
          onValueChange={(_event, selected) => onChange(selected.toISOString())}
        />
      </View>
    );
  }

  function openAndroidPicker() {
    DateTimePickerAndroid.open({
      value: date,
      mode: 'date',
      minimumDate,
      maximumDate,
      onValueChange: (_event, selectedDate) => {
        DateTimePickerAndroid.open({
          value: selectedDate,
          mode: 'time',
          is24Hour: true,
          onValueChange: (_timeEvent, selectedTime) => onChange(selectedTime.toISOString()),
        });
      },
    });
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${label}: ${formatDateTime(value)}`}
      onPress={openAndroidPicker}
      style={[styles.row, hasError && styles.error]}>
      <CalendarClock size={sizes.iconSm} color={colors.primary} />
      <AppText>{formatDateTime(value)}</AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: sizes.inputHeight,
    borderRadius: radius.md,
    borderWidth: borderWidth.hairline,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
  },
  flex: {
    flex: 1,
  },
  error: {
    borderColor: colors.critical,
  },
});
