import type { SQLiteDatabase } from 'expo-sqlite';
import { useCallback } from 'react';

import { useFocusQuery } from '@/hooks/useFocusQuery';

import { monitoringService, type Period } from '../services/monitoringService';
import type { ParameterKey } from '../types/parameter';

/** `aquariumId` nulo enquanto não há aquário selecionado. */
export function useMonitoringOverview(aquariumId: string | null) {
  const query = useCallback(
    (db: SQLiteDatabase) =>
      aquariumId ? monitoringService.getOverview(db, aquariumId) : Promise.resolve(null),
    [aquariumId],
  );
  return useFocusQuery(query);
}

export function useApplicableParameters(aquariumId: string) {
  const query = useCallback(
    (db: SQLiteDatabase) => monitoringService.getApplicableParameters(db, aquariumId),
    [aquariumId],
  );
  return useFocusQuery(query);
}

export function useParameterHistory(aquariumId: string, parameterId: ParameterKey, period: Period) {
  const query = useCallback(
    (db: SQLiteDatabase) => monitoringService.getHistory(db, aquariumId, parameterId, period),
    [aquariumId, parameterId, period],
  );
  return useFocusQuery(query);
}
