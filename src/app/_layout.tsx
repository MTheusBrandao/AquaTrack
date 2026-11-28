import { useFonts } from 'expo-font';
import { DarkTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { SQLiteProvider } from 'expo-sqlite';
import { StatusBar } from 'expo-status-bar';
import { Suspense, useEffect } from 'react';

import { LoadingState } from '@/components/ui';
import { DATABASE_NAME, initializeDatabase } from '@/database/database';
import { configureNotifications } from '@/features/maintenance/services/reminderScheduler';
import { colors, fontAssets, fontFamilyFor } from '@/theme';

configureNotifications();
SplashScreen.preventAutoHideAsync().catch(() => {});

/** Tema da navegação alinhado à paleta, para não piscar branco entre telas. */
const navigationTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: colors.primary,
    background: colors.background,
    card: colors.backgroundTop,
    text: colors.textPrimary,
    border: colors.border,
    notification: colors.critical,
  },
};

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts(fontAssets);
  const ready = fontsLoaded || fontError !== null;

  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => {});
  }, [ready]);

  // Sem a fonte o texto mudaria de largura depois de aparecer; se ela falhar, seguimos com a do sistema.
  if (!ready) return null;

  return (
    <ThemeProvider value={navigationTheme}>
      <Suspense fallback={<LoadingState />}>
        <SQLiteProvider databaseName={DATABASE_NAME} onInit={initializeDatabase} useSuspense>
          <StatusBar style="light" />
          <Stack
            screenOptions={{
              contentStyle: { backgroundColor: colors.background },
              headerTintColor: colors.primary,
              headerTitleStyle: { color: colors.textPrimary, fontFamily: fontFamilyFor('700') },
              headerStyle: { backgroundColor: colors.backgroundTop },
              headerShadowVisible: false,
              headerBackButtonDisplayMode: 'minimal',
            }}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="aquarium/create" options={{ title: 'Novo aquário' }} />
            <Stack.Screen name="aquarium/[id]" options={{ title: 'Aquário' }} />
            <Stack.Screen name="aquarium/edit/[id]" options={{ title: 'Editar aquário' }} />
            <Stack.Screen name="aquarium/add-species/[id]" options={{ title: 'Adicionar organismo' }} />
            <Stack.Screen name="aquarium/species/[id]" options={{ title: 'Organismo' }} />
            <Stack.Screen name="monitoring/add-measurement/[id]" options={{ title: 'Registrar medição' }} />
            <Stack.Screen name="monitoring/history/[id]" options={{ title: 'Histórico' }} />
            <Stack.Screen name="maintenance/create/[id]" options={{ title: 'Nova tarefa' }} />
            <Stack.Screen name="maintenance/details/[id]" options={{ title: 'Tarefa' }} />
            <Stack.Screen name="maintenance/edit/[id]" options={{ title: 'Editar tarefa' }} />
            <Stack.Screen name="tools" options={{ title: 'Calculadoras' }} />
            <Stack.Screen name="credits" options={{ title: 'Créditos das imagens' }} />
            <Stack.Screen name="equipment/create/[id]" options={{ title: 'Novo equipamento' }} />
            <Stack.Screen name="equipment/[id]" options={{ title: 'Equipamento' }} />
          </Stack>
        </SQLiteProvider>
      </Suspense>
    </ThemeProvider>
  );
}
