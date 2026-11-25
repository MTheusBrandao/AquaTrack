import type { SQLiteDatabase } from 'expo-sqlite';
import { useCallback } from 'react';

import { aquariumService } from '@/features/aquariums/services/aquariumService';
import { useFocusQuery } from '@/hooks/useFocusQuery';

import { maintenanceService } from '../services/maintenanceService';

export function useMaintenanceOverview() {
  return useFocusQuery(maintenanceService.getOverview);
}

export function useMaintenanceDetails(id: string) {
  const query = useCallback((db: SQLiteDatabase) => maintenanceService.getDetails(db, id), [id]);
  return useFocusQuery(query);
}

/** Dados do formulário: lista de aquários e, ao editar, a tarefa atual. */
export function useMaintenanceFormData(taskId: string | null) {
  const query = useCallback(
    async (db: SQLiteDatabase) => {
      const [aquariums, task] = await Promise.all([
        aquariumService.list(db),
        taskId ? maintenanceService.get(db, taskId) : Promise.resolve(null),
      ]);
      return { aquariums, task };
    },
    [taskId],
  );
  return useFocusQuery(query);
}
