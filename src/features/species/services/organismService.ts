import type { SQLiteDatabase } from 'expo-sqlite';

import { speciesRepository } from '@/database/repositories/speciesRepository';
import type { AquariumType } from '@/features/aquariums/types/aquarium';
import { createId } from '@/utils/id';

import type {
  AquariumOrganism,
  AquariumOrganismInput,
  CustomSpeciesInput,
  Species,
} from '../types/species';

export type SpeciesSelection =
  | { kind: 'catalog'; speciesId: string }
  | { kind: 'custom'; species: CustomSpeciesInput };

export const organismService = {
  listCatalog(db: SQLiteDatabase, waterType: AquariumType): Promise<Species[]> {
    return speciesRepository.listForWaterType(db, waterType);
  },

  get(db: SQLiteDatabase, id: string): Promise<AquariumOrganism | null> {
    return speciesRepository.findOrganism(db, id);
  },

  /** Uma espécie manual é criada junto com o vínculo, na mesma transação. */
  async add(
    db: SQLiteDatabase,
    aquariumId: string,
    selection: SpeciesSelection,
    input: AquariumOrganismInput,
  ): Promise<void> {
    const now = new Date().toISOString();

    await db.withTransactionAsync(async () => {
      let speciesId: string;
      if (selection.kind === 'custom') {
        speciesId = createId();
        await speciesRepository.insertCustom(db, speciesId, selection.species, now);
      } else {
        speciesId = selection.speciesId;
      }
      await speciesRepository.insertOrganism(db, createId(), aquariumId, speciesId, input, now);
    });
  },

  update(db: SQLiteDatabase, id: string, input: AquariumOrganismInput): Promise<void> {
    return speciesRepository.updateOrganism(db, id, input);
  },

  remove(db: SQLiteDatabase, id: string): Promise<void> {
    return speciesRepository.removeOrganism(db, id);
  },
};
