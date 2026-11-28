import type { SQLiteDatabase } from 'expo-sqlite';

import { speciesRepository } from '@/database/repositories/speciesRepository';
import type { AquariumType } from '@/features/aquariums/types/aquarium';
import {
  deleteStoredImage,
  isStoredImage,
  persistImage,
} from '@/features/aquariums/services/aquariumImageStorage';
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

/** Garante que a foto aponte para um arquivo do app, copiando a recém-escolhida do cache. */
async function prepareImage(imageUri: string | null): Promise<string | null> {
  if (imageUri === null || isStoredImage(imageUri)) return imageUri;
  return persistImage(imageUri);
}

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
    const imageUri = await prepareImage(input.imageUri);

    try {
      await db.withTransactionAsync(async () => {
        let speciesId: string;
        if (selection.kind === 'custom') {
          speciesId = createId();
          await speciesRepository.insertCustom(db, speciesId, selection.species, now);
        } else {
          speciesId = selection.speciesId;
        }
        await speciesRepository.insertOrganism(db, createId(), aquariumId, speciesId, { ...input, imageUri }, now);
      });
    } catch (error) {
      if (imageUri) deleteStoredImage(imageUri);
      throw error;
    }
  },

  async update(db: SQLiteDatabase, id: string, input: AquariumOrganismInput): Promise<void> {
    const current = await speciesRepository.findOrganism(db, id);
    if (!current) throw new Error('Organismo não encontrado.');

    const imageUri = await prepareImage(input.imageUri);
    try {
      await speciesRepository.updateOrganism(db, id, { ...input, imageUri });
    } catch (error) {
      if (imageUri && imageUri !== current.imageUri) deleteStoredImage(imageUri);
      throw error;
    }

    if (current.imageUri && current.imageUri !== imageUri) deleteStoredImage(current.imageUri);
  },

  async remove(db: SQLiteDatabase, id: string): Promise<void> {
    const current = await speciesRepository.findOrganism(db, id);
    await speciesRepository.removeOrganism(db, id);
    if (current?.imageUri) deleteStoredImage(current.imageUri);
  },
};
