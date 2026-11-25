import type { SQLiteDatabase } from 'expo-sqlite';
import { useCallback } from 'react';

import { aquariumService } from '@/features/aquariums/services/aquariumService';
import { useFocusQuery } from '@/hooks/useFocusQuery';

import { organismService } from '../services/organismService';

/** Aquário de destino e o catálogo compatível com o seu tipo de água. */
export function useSpeciesCatalog(aquariumId: string) {
  const query = useCallback(
    async (db: SQLiteDatabase) => {
      const aquarium = await aquariumService.get(db, aquariumId);
      if (!aquarium) return null;
      const catalog = await organismService.listCatalog(db, aquarium.type);
      return { aquarium, catalog };
    },
    [aquariumId],
  );
  return useFocusQuery(query);
}

export function useOrganism(id: string) {
  const query = useCallback((db: SQLiteDatabase) => organismService.get(db, id), [id]);
  return useFocusQuery(query);
}
