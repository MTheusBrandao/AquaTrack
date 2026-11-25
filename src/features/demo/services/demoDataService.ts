import type { SQLiteDatabase } from 'expo-sqlite';

import { aquariumRepository } from '@/database/repositories/aquariumRepository';
import { maintenanceRepository } from '@/database/repositories/maintenanceRepository';
import { parameterRepository } from '@/database/repositories/parameterRepository';
import { speciesRepository } from '@/database/repositories/speciesRepository';
import { aquariumService } from '@/features/aquariums/services/aquariumService';
import type { AquariumInput } from '@/features/aquariums/types/aquarium';
import type { MaintenanceInput } from '@/features/maintenance/types/maintenance';
import type { ParameterKey } from '@/features/monitoring/types/parameter';
import { createId } from '@/utils/id';
import { toLocalDateString } from '@/utils/format';

/** Dias atrás em que cada medição de exemplo foi feita (a última é a de hoje). */
const MEASUREMENT_DAYS_AGO = [28, 21, 14, 7, 3, 0];

type DemoAquarium = {
  aquarium: Omit<AquariumInput, 'setupDate'> & { setupDaysAgo: number };
  organisms: { speciesId: string; quantity: number }[];
  measurements: Partial<Record<ParameterKey, number[]>>;
  tasks: (Omit<MaintenanceInput, 'aquariumId' | 'scheduledAt' | 'reminderEnabled'> & {
    /** Dias a partir de hoje (negativo = atrasada). */
    inDays: number;
    lastCompletedDaysAgo?: number;
  })[];
};

const DEMO: DemoAquarium[] = [
  {
    aquarium: {
      name: 'Plantado da sala (exemplo)',
      type: 'freshwater',
      volume: 120,
      length: 80,
      width: 35,
      height: 45,
      setupDaysAgo: 210,
      targetTemperature: 26,
      description: 'Aquário comunitário plantado com CO₂ e iluminação de LED. Dados de demonstração.',
      imageUri: null,
    },
    organisms: [
      { speciesId: 'cat-neon-tetra', quantity: 12 },
      { speciesId: 'cat-peppered-cory', quantity: 6 },
      { speciesId: 'cat-amano', quantity: 4 },
      { speciesId: 'cat-anubias', quantity: 3 },
      { speciesId: 'cat-java-fern', quantity: 2 },
    ],
    measurements: {
      temperature: [25.5, 26, 25.8, 26.2, 25.9, 26.1],
      ph: [7, 7.1, 6.9, 7.2, 7, 7.1],
      ammonia: [0, 0, 0, 0, 0, 0],
      nitrite: [0, 0, 0, 0, 0, 0],
      // Nitrato subindo até sair da faixa: mostra o indicador de atenção.
      nitrate: [10, 15, 20, 30, 40, 45],
      gh: [8, 8, 7, 8, 8, 7],
      kh: [4, 4, 5, 4, 4, 4],
    },
    tasks: [
      { title: 'Troca parcial de água (30%)', category: 'water_change', description: null, frequency: 'weekly', inDays: -1, lastCompletedDaysAgo: 8 },
      { title: 'Poda das plantas', category: 'plant_trimming', description: null, frequency: 'biweekly', inDays: 3 },
    ],
  },
  {
    aquarium: {
      name: 'Recife nano (exemplo)',
      type: 'saltwater',
      volume: 60,
      length: 45,
      width: 35,
      height: 40,
      setupDaysAgo: 120,
      targetTemperature: 25.5,
      description: 'Nano reef com corais moles. Dados de demonstração.',
      imageUri: null,
    },
    organisms: [
      { speciesId: 'cat-ocellaris', quantity: 2 },
      { speciesId: 'cat-zoanthus', quantity: 1 },
      { speciesId: 'cat-cleaner-shrimp', quantity: 1 },
      { speciesId: 'cat-cerith', quantity: 5 },
    ],
    measurements: {
      temperature: [25.5, 25.8, 26, 25.9, 26.1, 25.7],
      ph: [8.1, 8.2, 8.1, 8, 8.2, 8.1],
      ammonia: [0, 0, 0, 0, 0, 0],
      nitrite: [0, 0, 0, 0, 0, 0],
      nitrate: [5, 5, 10, 10, 15, 10],
      kh: [8, 8.5, 8.2, 7.9, 8.1, 8.3],
    },
    tasks: [
      { title: 'Limpeza do skimmer', category: 'filter_cleaning', description: null, frequency: 'monthly', inDays: 6, lastCompletedDaysAgo: 24 },
      { title: 'Teste de parâmetros', category: 'parameter_test', description: null, frequency: 'weekly', inDays: 1 },
    ],
  },
];

function daysFromNow(days: number, hour: number): Date {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(hour, 0, 0, 0);
  return date;
}

export const demoDataService = {
  async hasDemoData(db: SQLiteDatabase): Promise<boolean> {
    return (await aquariumRepository.listDemoIds(db)).length > 0;
  },

  /**
   * Carrega os aquários de exemplo com organismos, medições e manutenções.
   * Tudo pende de aquários marcados como demonstração; lembretes ficam desligados.
   */
  async load(db: SQLiteDatabase): Promise<void> {
    if (await demoDataService.hasDemoData(db)) return;
    const now = new Date().toISOString();

    await db.withTransactionAsync(async () => {
      for (const demo of DEMO) {
        const aquariumId = createId();
        const { setupDaysAgo, ...aquarium } = demo.aquarium;
        await aquariumRepository.insert(
          db,
          aquariumId,
          { ...aquarium, setupDate: toLocalDateString(daysFromNow(-setupDaysAgo, 12)) },
          now,
        );
        await aquariumRepository.markDemo(db, aquariumId);

        for (const organism of demo.organisms) {
          await speciesRepository.insertOrganism(
            db,
            createId(),
            aquariumId,
            organism.speciesId,
            {
              quantity: organism.quantity,
              addedAt: toLocalDateString(daysFromNow(-setupDaysAgo + 30, 12)),
              notes: null,
            },
            now,
          );
        }

        for (const [parameterId, values] of Object.entries(demo.measurements)) {
          for (const [index, value] of (values ?? []).entries()) {
            await parameterRepository.insertRecord(
              db,
              {
                id: createId(),
                aquariumId,
                parameterId: parameterId as ParameterKey,
                value,
                measuredAt: daysFromNow(-MEASUREMENT_DAYS_AGO[index], 19).toISOString(),
                notes: null,
              },
              now,
            );
          }
        }

        for (const { inDays, lastCompletedDaysAgo, ...task } of demo.tasks) {
          const taskId = createId();
          await maintenanceRepository.insert(
            db,
            taskId,
            {
              ...task,
              aquariumId,
              scheduledAt: daysFromNow(inDays, 10).toISOString(),
              reminderEnabled: false,
            },
            now,
          );
          if (lastCompletedDaysAgo !== undefined) {
            await maintenanceRepository.insertLog(db, {
              id: createId(),
              taskId,
              aquariumId,
              title: task.title,
              category: task.category,
              scheduledFor: daysFromNow(-lastCompletedDaysAgo, 10).toISOString(),
              completedAt: daysFromNow(-lastCompletedDaysAgo, 11).toISOString(),
            });
          }
        }
      }
    });
  },

  /** Remove só os aquários de exemplo (e, em cascata, tudo que pertence a eles). */
  async remove(db: SQLiteDatabase): Promise<void> {
    const ids = await aquariumRepository.listDemoIds(db);
    for (const id of ids) {
      await aquariumService.remove(db, id);
    }
  },
};
