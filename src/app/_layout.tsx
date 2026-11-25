import { Stack } from 'expo-router';
import { SQLiteProvider } from 'expo-sqlite';
import { StatusBar } from 'expo-status-bar';
import { Suspense } from 'react';

import { LoadingState } from '@/components/ui';
import { DATABASE_NAME, initializeDatabase } from '@/database/database';
import { colors } from '@/theme';

export default function RootLayout() {
  return (
    <Suspense fallback={<LoadingState />}>
      <SQLiteProvider databaseName={DATABASE_NAME} onInit={initializeDatabase} useSuspense>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            contentStyle: { backgroundColor: colors.background },
            headerTintColor: colors.primary,
            headerTitleStyle: { color: colors.textPrimary },
            headerStyle: { backgroundColor: colors.background },
            headerShadowVisible: false,
            headerBackButtonDisplayMode: 'minimal',
          }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="aquarium/create" options={{ title: 'Novo aquário' }} />
          <Stack.Screen name="aquarium/[id]" options={{ title: 'Aquário' }} />
          <Stack.Screen name="aquarium/edit/[id]" options={{ title: 'Editar aquário' }} />
          <Stack.Screen name="aquarium/add-species/[id]" options={{ title: 'Adicionar organismo' }} />
          <Stack.Screen name="aquarium/species/[id]" options={{ title: 'Organismo' }} />
        </Stack>
      </SQLiteProvider>
    </Suspense>
  );
}
