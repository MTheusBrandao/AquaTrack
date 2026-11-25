import type { SQLiteDatabase } from 'expo-sqlite';

import type { AquariumType } from '@/features/aquariums/types/aquarium';
import type {
  ApplicableParameter,
  ParameterKey,
  ParameterRecord,
} from '@/features/monitoring/types/parameter';

type ApplicableRow = {
  id: ParameterKey;
  name: string;
  unit: string;
  decimals: number;
  min_value: number | null;
  max_value: number | null;
  reference_description: string | null;
};

type RecordRow = {
  id: string;
  aquarium_id: string;
  parameter_type_id: ParameterKey;
  value: number;
  measured_at: string;
  notes: string | null;
};

function toRecord(row: RecordRow): ParameterRecord {
  return {
    id: row.id,
    aquariumId: row.aquarium_id,
    parameterId: row.parameter_type_id,
    value: row.value,
    measuredAt: row.measured_at,
    notes: row.notes,
  };
}

export const parameterRepository = {
  /** Parâmetros que se aplicam ao tipo de aquário, já com a faixa de referência. */
  async listApplicable(db: SQLiteDatabase, aquariumType: AquariumType): Promise<ApplicableParameter[]> {
    const rows = await db.getAllAsync<ApplicableRow>(
      `SELECT t.id, t.name, t.unit, t.decimals, r.min_value, r.max_value, r.reference_description
       FROM parameter_types t
       JOIN parameter_references r ON r.parameter_type_id = t.id AND r.aquarium_type = ?
       ORDER BY t.sort_order`,
      aquariumType,
    );
    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      unit: row.unit,
      decimals: row.decimals,
      reference: {
        parameterId: row.id,
        minValue: row.min_value,
        maxValue: row.max_value,
        description: row.reference_description,
      },
    }));
  },

  async insertRecord(db: SQLiteDatabase, record: ParameterRecord, now: string): Promise<void> {
    await db.runAsync(
      `INSERT INTO parameter_records (id, aquarium_id, parameter_type_id, value, measured_at, notes, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      record.id,
      record.aquariumId,
      record.parameterId,
      record.value,
      record.measuredAt,
      record.notes,
      now,
    );
  },

  /** Histórico em ordem cronológica. `since` nulo = todo o período. */
  async listRecords(
    db: SQLiteDatabase,
    aquariumId: string,
    parameterId: ParameterKey,
    since: string | null,
  ): Promise<ParameterRecord[]> {
    const rows = await db.getAllAsync<RecordRow>(
      `SELECT * FROM parameter_records
       WHERE aquarium_id = ? AND parameter_type_id = ? AND (? IS NULL OR measured_at >= ?)
       ORDER BY measured_at ASC`,
      aquariumId,
      parameterId,
      since,
      since,
    );
    return rows.map(toRecord);
  },

  /** As duas medições mais recentes de cada parâmetro (a segunda serve para indicar tendência). */
  async listLatestTwo(db: SQLiteDatabase, aquariumId: string): Promise<ParameterRecord[]> {
    const rows = await db.getAllAsync<RecordRow>(
      `SELECT id, aquarium_id, parameter_type_id, value, measured_at, notes FROM (
         SELECT *, ROW_NUMBER() OVER (
           PARTITION BY parameter_type_id ORDER BY measured_at DESC, created_at DESC
         ) AS position
         FROM parameter_records
         WHERE aquarium_id = ?
       )
       WHERE position <= 2
       ORDER BY parameter_type_id, measured_at DESC`,
      aquariumId,
    );
    return rows.map(toRecord);
  },

  async deleteRecord(db: SQLiteDatabase, id: string): Promise<void> {
    await db.runAsync('DELETE FROM parameter_records WHERE id = ?', id);
  },
};
