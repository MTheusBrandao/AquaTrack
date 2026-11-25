import type { SQLiteDatabase } from 'expo-sqlite';
import { useCallback } from 'react';

import { aquariumService } from '@/features/aquariums/services/aquariumService';
import { equipmentService } from '@/features/equipment/services/equipmentService';
import { useFocusQuery } from '@/hooks/useFocusQuery';

import { maintenanceService } from '../services/maintenanceService';

export function useMaintenanceOverview() {
  return useFocusQuery(maintenanceService.getOverview);
}

export function useMaintenanceDetails(id: string) {
  const query = useCallback((db: SQLiteDatabase) => maintenanceService.getDetails(db, id), [id]);
  return useFocusQuery(query);
}

/** Dados do formulário: aquários, equipamentos e, ao editar, a tarefa atual. */
export function useMaintenanceFormData(taskId: string | null) {
  const query = useCallback(
    async (db: SQLiteDatabase) => {
      const [aquariums, equipment, task] = await Promise.all([
        aquariumService.list(db),
        equipmentService.list(db, null),
        taskId ? maintenanceService.get(db, taskId) : Promise.resolve(null),
      ]);
      return { aquariums, equipment, task };
    },
    [taskId],
  );
  return useFocusQuery(query);
}
