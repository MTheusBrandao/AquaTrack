import { ScrollView, StyleSheet } from 'react-native';

import { Chip } from '@/components/ui';
import { spacing } from '@/theme';

type AquariumSelectorProps = {
  aquariums: { id: string; name: string }[];
  selectedId: string | null;
  onSelect: (id: string) => void;
};

/** Seleção horizontal de aquário; some quando há apenas um. */
export function AquariumSelector({ aquariums, selectedId, onSelect }: AquariumSelectorProps) {
  if (aquariums.length < 2) return null;

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {aquariums.map((aquarium) => (
        <Chip
          key={aquarium.id}
          label={aquarium.name}
          selected={aquarium.id === selectedId}
          onPress={() => onSelect(aquarium.id)}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: spacing.sm,
  },
});
