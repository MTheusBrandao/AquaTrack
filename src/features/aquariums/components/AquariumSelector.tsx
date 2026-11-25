import { ScrollView, StyleSheet } from 'react-native';

import { Chip } from '@/components/ui';
import { spacing } from '@/theme';

type AquariumSelectorProps = {
  aquariums: { id: string; name: string }[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  /** Mostra o seletor mesmo com um único aquário (ex.: para aplicar o volume dele). */
  showSingle?: boolean;
};

/** Seleção horizontal de aquário; por padrão some quando há apenas um. */
export function AquariumSelector({ aquariums, selectedId, onSelect, showSingle }: AquariumSelectorProps) {
  if (aquariums.length === 0 || (aquariums.length === 1 && !showSingle)) return null;

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
