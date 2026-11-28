import { StyleSheet } from 'react-native';

import { borderWidth, colors, radius, spacing } from '@/theme';

import { AppText } from './AppText';
import { selectionFeedback } from './haptics';
import { PressableScale } from './PressableScale';

type ChipProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
};

export function Chip({ label, selected, onPress }: ChipProps) {
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={() => {
        if (!selected) selectionFeedback();
        onPress();
      }}
      style={[styles.chip, selected && styles.selected]}>
      <AppText variant="label" color={selected ? 'onPrimary' : 'textPrimary'} style={!selected && styles.idleText}>
        {label}
      </AppText>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  chip: {
    minHeight: 36,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    borderWidth: borderWidth.hairline,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
  },
  selected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  idleText: {
    fontWeight: '600',
  },
});
