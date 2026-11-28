import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui';
import { selectionFeedback } from '@/components/ui/haptics';
import { PressableScale } from '@/components/ui/PressableScale';
import { borderWidth, colors, radius, sizes, spacing } from '@/theme';

type Option<T extends string> = { value: T; label: string };

type SegmentedControlProps<T extends string> = {
  options: readonly Option<T>[];
  value: T;
  onChange: (value: T) => void;
};

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: SegmentedControlProps<T>) {
  return (
    <View style={styles.container} accessibilityRole="radiogroup">
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <PressableScale
            key={option.value}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            onPress={() => {
              if (!selected) selectionFeedback();
              onChange(option.value);
            }}
            style={[styles.segment, selected && styles.selected]}>
            <AppText variant="label" color={selected ? 'onPrimary' : 'textPrimary'}>
              {option.label}
            </AppText>
          </PressableScale>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: spacing.xs,
    gap: spacing.xs,
    borderRadius: radius.pill,
    borderWidth: borderWidth.hairline,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSunken,
  },
  segment: {
    flex: 1,
    minHeight: sizes.buttonHeightSmall,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selected: {
    backgroundColor: colors.primary,
  },
});
