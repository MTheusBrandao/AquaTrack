import { Tabs } from 'expo-router/js-tabs';
import {
  Activity,
  CalendarCheck,
  Fish,
  LayoutDashboard,
  UserRound,
  type LucideIcon,
} from 'lucide-react-native';

import { FloatingTabBar } from '@/components/navigation/FloatingTabBar';
import { colors } from '@/theme';

function tabIcon(Icon: LucideIcon) {
  return function TabBarIcon({ focused, size }: { focused: boolean; size: number }) {
    // A cor vem da barra flutuante: escura sobre a cápsula ativa, secundária nas demais.
    return <Icon size={size} color={focused ? colors.onPrimary : colors.textSecondary} strokeWidth={focused ? 2.25 : 1.75} />;
  };
}

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: colors.background },
      }}>
      <Tabs.Screen name="index" options={{ title: 'Início', tabBarIcon: tabIcon(LayoutDashboard) }} />
      <Tabs.Screen name="aquariums" options={{ title: 'Aquários', tabBarIcon: tabIcon(Fish) }} />
      <Tabs.Screen name="monitoring" options={{ title: 'Monitorar', tabBarIcon: tabIcon(Activity) }} />
      <Tabs.Screen name="maintenance" options={{ title: 'Manutenção', tabBarIcon: tabIcon(CalendarCheck) }} />
      <Tabs.Screen name="profile" options={{ title: 'Perfil', tabBarIcon: tabIcon(UserRound) }} />
    </Tabs>
  );
}
