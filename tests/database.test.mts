// Exercita migration + repositories reais contra o SQLite do Node, com um shim da API do expo-sqlite.
import { DatabaseSync } from 'node:sqlite';
import assert from 'node:assert/strict';

const root = new URL('../src/database/', import.meta.url).href;
const { initializeDatabase } = await import(root + 'database.ts');
const { aquariumRepository } = await import(root + 'repositories/aquariumRepository.ts');
const { speciesRepository } = await import(root + 'repositories/speciesRepository.ts');


const raw = new DatabaseSync(':memory:');
const db = {
  async execAsync(sql: string) { raw.exec(sql); },
  async runAsync(sql: string, ...params: unknown[]) { return raw.prepare(sql).run(...(params as never[])); },
  async getAllAsync(sql: string, ...params: unknown[]) { return raw.prepare(sql).all(...(params as never[])); },
  async getFirstAsync(sql: string, ...params: unknown[]) { return raw.prepare(sql).get(...(params as never[])) ?? null; },
  async withTransactionAsync(task: () => Promise<void>) {
    raw.exec('BEGIN');
    try { await task(); raw.exec('COMMIT'); } catch (e) { raw.exec('ROLLBACK'); throw e; }
  },
} as never;

await initializeDatabase(db);
await initializeDatabase(db); // idempotente: não deve reaplicar a migration
assert.equal((raw.prepare('PRAGMA user_version').get() as { user_version: number }).user_version, 6);
assert.equal((raw.prepare('PRAGMA foreign_keys').get() as { foreign_keys: number }).foreign_keys, 1);

const fresh = await speciesRepository.listForWaterType(db, 'freshwater');
const salt = await speciesRepository.listForWaterType(db, 'saltwater');
assert.ok(fresh.length > 10 && salt.length > 5);
assert.ok(fresh.every((s: { waterType: string }) => s.waterType === 'freshwater'));

const now = new Date().toISOString();
const input = { name: 'Plantado', type: 'freshwater', volume: 120, length: 80, width: 30, height: 50, setupDate: '2026-01-10', targetTemperature: 26, description: null, imageUri: null };
await aquariumRepository.insert(db, 'aq1', input, now);
await speciesRepository.insertOrganism(db, 'o1', 'aq1', 'cat-neon-tetra', { quantity: 10, addedAt: null, notes: null, imageUri: null }, now);
await speciesRepository.insertCustom(db, 'sp-custom', { commonName: 'Tetra-limão', scientificName: null, category: 'fish', waterType: 'freshwater' }, now);
await speciesRepository.insertOrganism(db, 'o2', 'aq1', 'sp-custom', { quantity: 5, addedAt: '2026-02-01', notes: 'ok', imageUri: 'aquarium-images/o2.jpg' }, now);

const list = await aquariumRepository.listWithStats(db);
assert.equal(list[0].speciesCount, 2);
assert.equal((await speciesRepository.listOrganisms(db, 'aq1')).length, 2);
assert.equal((await speciesRepository.findOrganism(db, 'o2')).species.isCustom, true);
assert.equal((await speciesRepository.findOrganism(db, 'o2')).imageUri, 'aquarium-images/o2.jpg');

await aquariumRepository.update(db, 'aq1', { ...input, name: 'Plantado 2', length: null }, now);
const updated = await aquariumRepository.findById(db, 'aq1');
assert.equal(updated.name, 'Plantado 2');
assert.equal(updated.length, null);

// Constraints
await assert.rejects(() => aquariumRepository.insert(db, 'bad', { ...input, volume: 0 }, now));
await assert.rejects(() => speciesRepository.insertOrganism(db, 'o3', 'nope', 'cat-betta', { quantity: 1, addedAt: null, notes: null, imageUri: null }, now), /FOREIGN KEY/);

// Cascade
await aquariumRepository.remove(db, 'aq1');
assert.equal((raw.prepare('SELECT COUNT(*) AS n FROM aquarium_species').get() as { n: number }).n, 0);
assert.ok(await raw.prepare("SELECT 1 FROM species WHERE id = 'sp-custom'").get(), 'espécie personalizada permanece');

console.log('OK: migration, catálogo, CRUD, constraints e cascata');

