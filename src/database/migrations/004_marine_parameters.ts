import type { SQLiteDatabase } from 'expo-sqlite';

import { MARINE_PARAMETER_REFERENCES, MARINE_PARAMETER_TYPES } from '../seeds/parameters';

/** Salinidade, cálcio, magnésio e fosfato, com faixas gerais para marinho (e salinidade na salobra). */
export async function up(db: SQLiteDatabase): Promise<void> {
  const row = await db.getFirstAsync<{ next: number }>(
    'SELECT COALESCE(MAX(sort_order), -1) + 1 AS next FROM parameter_types',
  );
  let sortOrder = row?.next ?? 0;

  for (const type of MARINE_PARAMETER_TYPES) {
    await db.runAsync(
      'INSERT INTO parameter_types (id, name, unit, decimals, sort_order) VALUES (?, ?, ?, ?, ?)',
      type.id,
      type.name,
      type.unit,
      type.decimals,
      sortOrder++,
    );
  }

  for (const reference of MARINE_PARAMETER_REFERENCES) {
    await db.runAsync(
      `INSERT INTO parameter_references
         (parameter_type_id, aquarium_type, min_value, max_value, reference_description)
       VALUES (?, ?, ?, ?, ?)`,
      reference.parameterId,
      reference.aquariumType,
      reference.min,
      reference.max,
      reference.description,
    );
  }
}
