import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn, LinearTransition } from 'react-native-reanimated';

import { AppText } from '@/components/ui';
import { selectionFeedback } from '@/components/ui/haptics';
import { PressableScale } from '@/components/ui/PressableScale';
import { borderWidth, colors, elevation, radius, sizes, spacing } from '@/theme';

const LAYOUT = LinearTransition.springify().damping(20).stiffness(220);

/**
 * Barra de abas em pílula flutuante. A aba ativa vira uma cápsula com ícone + nome; as outras
 * mostram só o ícone (o nome continua no leitor de tela).
 */
export function FloatingTabBar({ state, descriptors, emitter, navigateToTab, insets }: BottomTabBarProps) {
  return (
    <View pointerEvents="box-none" style={[styles.wrapper, { bottom: Math.max(insets.bottom, spacing.md) }]}>
      <View style={styles.bar} role="tablist">
        {state.routes.map((route, index) => {
          const focused = index === state.index;
          const { options } = descriptors[route.key];
          const title = options.title ?? route.name;
          const color = focused ? colors.onPrimary : colors.textSecondary;

          const onPress = () => {
            const event = emitter.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!focused && !event.defaultPrevented) {
              selectionFeedback();
              navigateToTab(route.key);
            }
          };

          return (
            <Animated.View key={route.key} layout={LAYOUT} style={focused ? styles.focusedSlot : styles.slot}>
              <PressableScale
                accessibilityRole="tab"
                accessibilityLabel={title}
                accessibilityState={{ selected: focused }}
                onPress={onPress}
                onLongPress={() => emitter.emit({ type: 'tabLongPress', target: route.key })}
                style={[styles.item, focused && styles.itemFocused]}>
                {options.tabBarIcon?.({ focused, color, size: sizes.iconMd })}
                {focused ? (
                  <Animated.View entering={FadeIn.duration(200)}>
                    <AppText variant="tabLabel" color="onPrimary" numberOfLines={1}>
                      {title}
                    </AppText>
                  </Animated.View>
                ) : null}
              </PressableScale>
            </Animated.View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: sizes.tabBarHeight + spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.tabBar,
    borderWidth: borderWidth.hairline,
    borderColor: colors.borderStrong,
    ...elevation.floating,
  },
  slot: {
    flex: 1,
  },
  focusedSlot: {
    flex: 2.2,
  },
  item: {
    height: 48,
    borderRadius: radius.pill,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs + 2,
  },
  itemFocused: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
  },
});
