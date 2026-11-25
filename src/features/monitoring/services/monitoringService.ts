import type { SQLiteDatabase } from 'expo-sqlite';

import { aquariumRepository } from '@/database/repositories/aquariumRepository';
import { parameterRepository } from '@/database/repositories/parameterRepository';
import type { Aquarium } from '@/features/aquariums/types/aquarium';
import { createId } from '@/utils/id';

import type {
  ApplicableParameter,
  MeasurementInput,
  ParameterKey,
  ParameterRecord,
  ParameterStatus,
} from '../types/parameter';
import { getParameterStatus } from '../utils/parameterStatus';

export type ParameterSummary = {
  parameter: ApplicableParameter;
  latest: ParameterRecord | null;
  previous: ParameterRecord | null;
  status: ParameterStatus | null;
};

export type MonitoringOverview = {
  aquarium: Aquarium;
  parameters: ParameterSummary[];
};

export const PERIODS = ['7d', '30d', '90d', 'all'] as const;
export type Period = (typeof PERIODS)[number];

export const PERIOD_LABELS: Record<Period, string> = {
  '7d': '7 dias',
  '30d': '30 dias',
  '90d': '90 dias',
  all: 'Tudo',
};

const PERIOD_DAYS: Record<Exclude<Period, 'all'>, number> = { '7d': 7, '30d': 30, '90d': 90 };

function periodStart(period: Period, now: Date): string | null {
  if (period === 'all') return null;
  const start = new Date(now);
  start.setDate(start.getDate() - PERIOD_DAYS[period]);
  return start.toISOString();
}

export type ParameterHistory = {
  aquarium: Aquarium;
  parameters: ApplicableParameter[];
  records: ParameterRecord[];
};

export const monitoringService = {
  async getApplicableParameters(db: SQLiteDatabase, aquariumId: string) {
    const aquarium = await aquariumRepository.findById(db, aquariumId);
    if (!aquarium) return null;
    const parameters = await parameterRepository.listApplicable(db, aquarium.type);
    return { aquarium, parameters };
  },

  async getOverview(db: SQLiteDatabase, aquariumId: string): Promise<MonitoringOverview | null> {
    const base = await monitoringService.getApplicableParameters(db, aquariumId);
    if (!base) return null;
    const latest = await parameterRepository.listLatestTwo(db, aquariumId);

    const parameters = base.parameters.map((parameter) => {
      const [first = null, second = null] = latest.filter((record) => record.parameterId === parameter.id);
      return {
        parameter,
        latest: first,
        previous: second,
        status: first ? getParameterStatus(first.value, parameter.reference) : null,
      };
    });
    return { aquarium: base.aquarium, parameters };
  },

  async getHistory(
    db: SQLiteDatabase,
    aquariumId: string,
    parameterId: ParameterKey,
    period: Period,
  ): Promise<ParameterHistory | null> {
    const base = await monitoringService.getApplicableParameters(db, aquariumId);
    if (!base) return null;
    const records = await parameterRepository.listRecords(
      db,
      aquariumId,
      parameterId,
      periodStart(period, new Date()),
    );
    return { ...base, records };
  },

  /** Cada parâmetro preenchido vira um registro; os não preenchidos simplesmente não são gravados. */
  async addMeasurement(db: SQLiteDatabase, aquariumId: string, input: MeasurementInput): Promise<number> {
    const entries = Object.entries(input.values).filter(
      (entry): entry is [ParameterKey, number] => typeof entry[1] === 'number',
    );
    if (entries.length === 0) throw new Error('Nenhum parâmetro informado.');

    const now = new Date().toISOString();
    await db.withTransactionAsync(async () => {
      for (const [parameterId, value] of entries) {
        await parameterRepository.insertRecord(
          db,
          {
            id: createId(),
            aquariumId,
            parameterId,
            value,
            measuredAt: input.measuredAt,
            notes: input.notes,
          },
          now,
        );
      }
    });
    return entries.length;
  },

  deleteRecord(db: SQLiteDatabase, id: string): Promise<void> {
    return parameterRepository.deleteRecord(db, id);
  },
};
