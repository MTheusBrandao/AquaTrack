import { Search } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { AppText, Button, Card, Chip } from '@/components/ui';
import { borderWidth, colors, fontFamilyFor, radius, sizes, spacing, typography } from '@/theme';

import { SPECIES_CATEGORIES, SPECIES_CATEGORY_LABELS, type Species, type SpeciesCategory } from '../types/species';
import { SpeciesIcon } from './SpeciesIcon';

function normalize(text: string): string {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

type SpeciesCatalogProps = {
  species: Species[];
  onSelect: (species: Species) => void;
  /** Recebe o texto buscado para pré-preencher o cadastro manual. */
  onCreateCustom: (searchText: string) => void;
};

export function SpeciesCatalog({ species, onSelect, onCreateCustom }: SpeciesCatalogProps) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<SpeciesCategory | null>(null);

  const availableCategories = useMemo(
    () => SPECIES_CATEGORIES.filter((value) => species.some((item) => item.category === value)),
    [species],
  );

  const filtered = useMemo(() => {
    const term = normalize(search.trim());
    return species.filter(
      (item) =>
        (category === null || item.category === category) &&
        (term === '' ||
          normalize(item.commonName).includes(term) ||
          normalize(item.scientificName ?? '').includes(term)),
    );
  }, [species, search, category]);

  return (
    <View style={styles.container}>
      <View style={styles.searchBox}>
        <Search size={sizes.iconSm} color={colors.textSecondary} />
        <TextInput
          accessibilityLabel="Buscar espécie"
          placeholder="Buscar por nome popular ou científico"
          placeholderTextColor={colors.textSecondary}
          value={search}
          onChangeText={setSearch}
          autoCorrect={false}
          style={styles.searchInput}
        />
      </View>

      <View style={styles.chips}>
        <Chip label="Todas" selected={category === null} onPress={() => setCategory(null)} />
        {availableCategories.map((value) => (
          <Chip
            key={value}
            label={SPECIES_CATEGORY_LABELS[value]}
            selected={category === value}
            onPress={() => setCategory(value)}
          />
        ))}
      </View>

      <Card style={styles.list}>
        {filtered.length === 0 ? (
          <AppText color="textSecondary" align="center" style={styles.noResults}>
            Nenhuma espécie encontrada no catálogo.
          </AppText>
        ) : (
          filtered.map((item) => (
            <Pressable
              key={item.id}
              accessibilityRole="button"
              accessibilityLabel={`Selecionar ${item.commonName}`}
              onPress={() => onSelect(item)}
              style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
              <SpeciesIcon category={item.category} />
              <View style={styles.info}>
                <AppText variant="label">{item.commonName}</AppText>
                {item.scientificName ? (
                  <AppText variant="caption" color="textSecondary" style={styles.italic}>
                    {item.scientificName}
                  </AppText>
                ) : null}
              </View>
              {item.isCustom ? (
                <AppText variant="caption" color="textSecondary">
                  Sua espécie
                </AppText>
              ) : null}
            </Pressable>
          ))
        )}
      </Card>

      <Button
        label="Não encontrou? Cadastrar manualmente"
        variant="secondary"
        onPress={() => onCreateCustom(search.trim())}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.lg,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: sizes.inputHeight,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    borderWidth: borderWidth.hairline,
    borderColor: colors.border,
    backgroundColor: colors.surfaceRaised,
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    fontFamily: fontFamilyFor(typography.body.fontWeight),
    fontWeight: 'normal',
    color: colors.textPrimary,
    paddingVertical: spacing.sm,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  list: {
    paddingVertical: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  info: {
    flex: 1,
    gap: spacing.xxs,
  },
  italic: {
    fontStyle: 'italic',
  },
  pressed: {
    opacity: 0.7,
  },
  noResults: {
    paddingVertical: spacing.lg,
  },
});
