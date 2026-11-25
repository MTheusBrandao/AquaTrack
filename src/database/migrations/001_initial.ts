import type { SQLiteDatabase } from 'expo-sqlite';

import { CATALOG_SPECIES } from '../seeds/speciesCatalog';

/**
 * Schema inicial: aquários, catálogo de espécies e organismos de cada aquário.
 * Parâmetros e manutenções entram em migrations próprias na Fase 3.
 */
export async function up(db: SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    CREATE TABLE aquariums (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('freshwater', 'saltwater', 'brackish')),
      volume REAL NOT NULL CHECK (volume > 0),
      length REAL CHECK (length IS NULL OR length > 0),
      width REAL CHECK (width IS NULL OR width > 0),
      height REAL CHECK (height IS NULL OR height > 0),
      setup_date TEXT,
      target_temperature REAL,
      description TEXT,
      image_uri TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE species (
      id TEXT PRIMARY KEY NOT NULL,
      common_name TEXT NOT NULL,
      scientific_name TEXT,
      category TEXT NOT NULL CHECK (
        category IN ('fish', 'plant', 'coral', 'shrimp', 'snail', 'other_invertebrate')
      ),
      water_type TEXT CHECK (water_type IS NULL OR water_type IN ('freshwater', 'saltwater', 'brackish')),
      description TEXT,
      is_custom INTEGER NOT NULL DEFAULT 0 CHECK (is_custom IN (0, 1)),
      created_at TEXT NOT NULL
    );

    CREATE TABLE aquarium_species (
      id TEXT PRIMARY KEY NOT NULL,
      aquarium_id TEXT NOT NULL REFERENCES aquariums (id) ON DELETE CASCADE,
      species_id TEXT NOT NULL REFERENCES species (id) ON DELETE RESTRICT,
      quantity INTEGER NOT NULL CHECK (quantity > 0),
      added_at TEXT,
      notes TEXT,
      created_at TEXT NOT NULL
    );

    CREATE INDEX idx_aquarium_species_aquarium ON aquarium_species (aquarium_id);
    CREATE INDEX idx_aquarium_species_species ON aquarium_species (species_id);
    CREATE INDEX idx_species_category ON species (category);
  `);

  const createdAt = new Date().toISOString();
  for (const species of CATALOG_SPECIES) {
    await db.runAsync(
      `INSERT INTO species (id, common_name, scientific_name, category, water_type, is_custom, created_at)
       VALUES (?, ?, ?, ?, ?, 0, ?)`,
      species.id,
      species.commonName,
      species.scientificName,
      species.category,
      species.waterType,
      createdAt,
    );
  }
}
