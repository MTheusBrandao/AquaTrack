import type { SQLiteDatabase } from 'expo-sqlite';
import { useCallback } from 'react';

import { useFocusQuery } from '@/hooks/useFocusQuery';

import { equipmentService } from '../services/equipmentService';

export function useEquipmentList(aquariumId: string) {
  const query = useCallback((db: SQLiteDatabase) => equipmentService.list(db, aquariumId), [aquariumId]);
  return useFocusQuery(query);
}

export function useEquipmentDetails(id: string) {
  const query = useCallback((db: SQLiteDatabase) => equipmentService.getDetails(db, id), [id]);
  return useFocusQuery(query);
}
