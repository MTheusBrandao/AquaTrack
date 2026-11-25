import type { SQLiteDatabase } from 'expo-sqlite';

import { equipmentRepository } from '@/database/repositories/equipmentRepository';
import { maintenanceRepository } from '@/database/repositories/maintenanceRepository';
import type { MaintenanceTask } from '@/features/maintenance/types/maintenance';
import { createId } from '@/utils/id';

import type { Equipment, EquipmentInput } from '../types/equipment';

export type EquipmentDetails = {
  equipment: Equipment;
  /** Tarefas abertas vinculadas a este equipamento. */
  tasks: MaintenanceTask[];
};

export const equipmentService = {
  list(db: SQLiteDatabase, aquariumId: string | null): Promise<Equipment[]> {
    return equipmentRepository.list(db, aquariumId);
  },

  async getDetails(db: SQLiteDatabase, id: string): Promise<EquipmentDetails | null> {
    const equipment = await equipmentRepository.findById(db, id);
    if (!equipment) return null;
    const tasks = await maintenanceRepository.listByEquipment(db, id);
    return { equipment, tasks };
  },

  async create(db: SQLiteDatabase, input: EquipmentInput): Promise<string> {
    const id = createId();
    await equipmentRepository.insert(db, id, input, new Date().toISOString());
    return id;
  },

  /** O aquário do equipamento não muda: as tarefas vinculadas pertencem a ele. */
  async update(db: SQLiteDatabase, id: string, input: EquipmentInput): Promise<void> {
    const current = await equipmentRepository.findById(db, id);
    if (!current) throw new Error('Equipamento não encontrado.');
    await equipmentRepository.update(
      db,
      id,
      { ...input, aquariumId: current.aquariumId },
      new Date().toISOString(),
    );
  },

  remove(db: SQLiteDatabase, id: string): Promise<void> {
    return equipmentRepository.remove(db, id);
  },
};
