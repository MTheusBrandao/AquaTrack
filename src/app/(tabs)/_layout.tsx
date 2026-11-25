import { Tabs } from 'expo-router/js-tabs';
import {
  Activity,
  CalendarCheck,
  Fish,
  LayoutDashboard,
  UserRound,
  type LucideIcon,
} from 'lucide-react-native';

import { colors, sizes, typography } from '@/theme';

function tabIcon(Icon: LucideIcon) {
  return function TabBarIcon({ focused }: { focused: boolean }) {
    return (
      <Icon
        size={sizes.iconMd}
        color={focused ? colors.primary : colors.textSecondary}
        strokeWidth={focused ? 2.25 : 1.75}
      />
    );
  };
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarLabelStyle: typography.tabLabel,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
        sceneStyle: { backgroundColor: colors.background },
      }}>
      <Tabs.Screen name="index" options={{ title: 'Início', tabBarIcon: tabIcon(LayoutDashboard) }} />
      <Tabs.Screen name="aquariums" options={{ title: 'Aquários', tabBarIcon: tabIcon(Fish) }} />
      <Tabs.Screen
        name="monitoring"
        options={{ title: 'Monitorar', tabBarIcon: tabIcon(Activity) }}
      />
      <Tabs.Screen
        name="maintenance"
        options={{ title: 'Manutenção', tabBarIcon: tabIcon(CalendarCheck) }}
      />
      <Tabs.Screen name="profile" options={{ title: 'Perfil', tabBarIcon: tabIcon(UserRound) }} />
    </Tabs>
  );
}
