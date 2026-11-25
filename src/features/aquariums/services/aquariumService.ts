import type { SQLiteDatabase } from 'expo-sqlite';

import { aquariumRepository } from '@/database/repositories/aquariumRepository';
import { speciesRepository } from '@/database/repositories/speciesRepository';
import { maintenanceService } from '@/features/maintenance/services/maintenanceService';
import type { AquariumOrganism } from '@/features/species/types/species';
import { createId } from '@/utils/id';

import type { Aquarium, AquariumInput, AquariumWithStats } from '../types/aquarium';
import { deleteStoredImage, isStoredImage, persistImage } from './aquariumImageStorage';

export type AquariumDetails = {
  aquarium: Aquarium;
  organisms: AquariumOrganism[];
};

/** Garante que imageUri aponte para um arquivo do app, copiando imagens recém-escolhidas. */
async function prepareImage(imageUri: string | null): Promise<string | null> {
  if (imageUri === null || isStoredImage(imageUri)) return imageUri;
  return persistImage(imageUri);
}

export const aquariumService = {
  list(db: SQLiteDatabase): Promise<AquariumWithStats[]> {
    return aquariumRepository.listWithStats(db);
  },

  async getDetails(db: SQLiteDatabase, id: string): Promise<AquariumDetails | null> {
    const aquarium = await aquariumRepository.findById(db, id);
    if (!aquarium) return null;
    const organisms = await speciesRepository.listOrganisms(db, id);
    return { aquarium, organisms };
  },

  get(db: SQLiteDatabase, id: string): Promise<Aquarium | null> {
    return aquariumRepository.findById(db, id);
  },

  async create(db: SQLiteDatabase, input: AquariumInput): Promise<string> {
    const id = createId();
    const imageUri = await prepareImage(input.imageUri);
    try {
      await aquariumRepository.insert(db, id, { ...input, imageUri }, new Date().toISOString());
    } catch (error) {
      if (imageUri) deleteStoredImage(imageUri);
      throw error;
    }
    return id;
  },

  async update(db: SQLiteDatabase, id: string, input: AquariumInput): Promise<void> {
    const current = await aquariumRepository.findById(db, id);
    if (!current) throw new Error('Aquário não encontrado.');

    const imageUri = await prepareImage(input.imageUri);
    try {
      await aquariumRepository.update(db, id, { ...input, imageUri }, new Date().toISOString());
    } catch (error) {
      if (imageUri && imageUri !== current.imageUri) deleteStoredImage(imageUri);
      throw error;
    }

    if (current.imageUri && current.imageUri !== imageUri) deleteStoredImage(current.imageUri);
  },

  async remove(db: SQLiteDatabase, id: string): Promise<void> {
    const current = await aquariumRepository.findById(db, id);
    if (!current) return;
    await maintenanceService.cancelRemindersForAquarium(db, id);
    // Medições, organismos, tarefas e histórico de manutenção saem em cascata.
    await aquariumRepository.remove(db, id);
    if (current.imageUri) deleteStoredImage(current.imageUri);
  },
};
