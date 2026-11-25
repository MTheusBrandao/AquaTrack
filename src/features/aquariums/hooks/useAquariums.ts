import type { SQLiteDatabase } from 'expo-sqlite';
import { useCallback } from 'react';

import { useFocusQuery } from '@/hooks/useFocusQuery';

import { aquariumService } from '../services/aquariumService';

export function useAquariums() {
  return useFocusQuery(aquariumService.list);
}

export function useAquariumDetails(id: string) {
  const query = useCallback((db: SQLiteDatabase) => aquariumService.getDetails(db, id), [id]);
  return useFocusQuery(query);
}

export function useAquarium(id: string) {
  const query = useCallback((db: SQLiteDatabase) => aquariumService.get(db, id), [id]);
  return useFocusQuery(query);
}
