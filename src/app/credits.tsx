import { ExternalLink, ImageOff } from 'lucide-react-native';
import { Linking, Pressable, StyleSheet, View } from 'react-native';

import { AppText, Card, EmptyState, Screen } from '@/components/ui';
import { listPhotoCredits } from '@/features/species/data/photoCredits';
import { colors, sizes, spacing } from '@/theme';

/**
 * Atribuição das fotos padrão das espécies. Licenças CC BY e CC BY-SA exigem autor, licença e
 * link visíveis para quem usa o app; fotos próprias aparecem como tal.
 */
export default function CreditsScreen() {
  const entries = listPhotoCredits();

  if (entries.length === 0) {
    return (
      <Screen>
        <EmptyState
          icon={ImageOff}
          title="Nenhuma foto de terceiros"
          description="As espécies estão usando ilustrações ou fotos suas."
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <AppText color="textSecondary">
        Fotos padrão das espécies do catálogo. Fotos que você tira dos seus animais ficam só no seu aparelho.
      </AppText>
      <Card style={styles.list}>
        {entries.map(({ speciesId, speciesName, credit }, index) => (
          <View key={speciesId} style={[styles.row, index > 0 && styles.divider]}>
            <AppText variant="label">{speciesName}</AppText>
            {credit.source === 'own' ? (
              <AppText variant="caption" color="textSecondary">
                Foto própria do AquaTrack
              </AppText>
            ) : (
              <>
                <AppText variant="caption" color="textSecondary">
                  {credit.author} · {credit.license} · Wikimedia Commons
                </AppText>
                <View style={styles.links}>
                  <CreditLink label="Ver original" url={credit.sourceUrl} />
                  {credit.licenseUrl ? <CreditLink label="Licença" url={credit.licenseUrl} /> : null}
                </View>
              </>
            )}
          </View>
        ))}
      </Card>
    </Screen>
  );
}

function CreditLink({ label, url }: { label: string; url: string }) {
  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={`${label}: ${url}`}
      hitSlop={spacing.sm}
      onPress={() => Linking.openURL(url).catch(() => {})}
      style={styles.link}>
      <AppText variant="caption" color="primary">
        {label}
      </AppText>
      <ExternalLink size={sizes.iconSm - 4} color={colors.primary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  list: {
    paddingVertical: spacing.xs,
  },
  row: {
    gap: spacing.xxs,
    paddingVertical: spacing.md,
  },
  divider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  links: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginTop: spacing.xxs,
  },
  link: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
  },
});
