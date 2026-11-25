import type { SQLiteDatabase } from 'expo-sqlite';

import { maintenanceRepository } from '@/database/repositories/maintenanceRepository';
import { parameterRepository, type RecentRecord } from '@/database/repositories/parameterRepository';
import { aquariumService } from '@/features/aquariums/services/aquariumService';
import type { AquariumWithStats } from '@/features/aquariums/types/aquarium';
import type { MaintenanceTask } from '@/features/maintenance/types/maintenance';
import { getMaintenanceStatus } from '@/features/maintenance/utils/recurrence';
import { monitoringService, type ParameterSummary } from '@/features/monitoring/services/monitoringService';

export type AttentionItem = ParameterSummary & {
  aquariumId: string;
  aquariumName: string;
};

export type AquariumSummary = {
  aquarium: AquariumWithStats;
  lastMeasuredAt: string | null;
  attentionCount: number;
  overdueCount: number;
};

export type DashboardSummary = {
  aquariums: AquariumSummary[];
  attention: AttentionItem[];
  overdue: MaintenanceTask[];
  upcoming: MaintenanceTask[];
  recentRecords: RecentRecord[];
  hasDemoData: boolean;
};

const UPCOMING_LIMIT = 3;
const RECENT_RECORDS_LIMIT = 5;

export const dashboardService = {
  /** Reúne os dados reais de todos os módulos para a tela inicial. */
  async getSummary(db: SQLiteDatabase): Promise<DashboardSummary> {
    const [aquariums, openTasks, recentRecords] = await Promise.all([
      aquariumService.list(db),
      maintenanceRepository.listOpen(db, null),
      parameterRepository.listRecent(db, RECENT_RECORDS_LIMIT),
    ]);

    const now = new Date();
    const overdue = openTasks.filter((task) => getMaintenanceStatus(task, now) === 'overdue');
    const upcoming = openTasks
      .filter((task) => getMaintenanceStatus(task, now) === 'pending')
      .slice(0, UPCOMING_LIMIT);

    const attention: AttentionItem[] = [];
    const summaries: AquariumSummary[] = [];

    // Poucos aquários por usuário: uma consulta de visão geral por aquário é suficiente.
    for (const aquarium of aquariums) {
      const overview = await monitoringService.getOverview(db, aquarium.id);
      const parameters = overview?.parameters ?? [];
      const outOfRange = parameters.filter((summary) => summary.status === 'out_of_range');

      attention.push(
        ...outOfRange.map((summary) => ({
          ...summary,
          aquariumId: aquarium.id,
          aquariumName: aquarium.name,
        })),
      );

      const measuredDates = parameters
        .map((summary) => summary.latest?.measuredAt)
        .filter((date): date is string => Boolean(date))
        .sort();

      summaries.push({
        aquarium,
        lastMeasuredAt: measuredDates.at(-1) ?? null,
        attentionCount: outOfRange.length,
        overdueCount: overdue.filter((task) => task.aquariumId === aquarium.id).length,
      });
    }

    return {
      aquariums: summaries,
      attention,
      overdue,
      upcoming,
      recentRecords,
      hasDemoData: aquariums.some((aquarium) => aquarium.isDemo),
    };
  },
};
