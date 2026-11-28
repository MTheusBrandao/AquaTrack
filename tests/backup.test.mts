import assert from 'node:assert/strict';
import { test } from 'node:test';

import { createTestDatabase } from './helpers/db.mts';

const src = (path: string) => new URL(`../src/${path}`, import.meta.url).href;
const { initializeDatabase } = await import(src('database/database.ts'));
const { aquariumService } = await import(src('features/aquariums/services/aquariumService.ts'));
const { organismService } = await import(src('features/species/services/organismService.ts'));
const { maintenanceService } = await import(src('features/maintenance/services/maintenanceService.ts'));
const { demoDataService } = await import(src('features/demo/services/demoDataService.ts'));
const { backupService, BackupError } = await import(src('features/backup/services/backupService.ts'));
const notifications = await import(new URL('./stubs/expo-notifications.mjs', import.meta.url).href);

const count = (raw: { prepare: (sql: string) => { get: () => unknown } }, table: string) =>
  (raw.prepare(`SELECT COUNT(*) AS n FROM ${table}`).get() as { n: number }).n;

const TABLES = ['aquariums', 'aquarium_species', 'parameter_records', 'maintenance_tasks', 'maintenance_logs'];

async function populatedDevice() {
  const device = createTestDatabase();
  await initializeDatabase(device.db);
  await demoDataService.load(device.db);
  const aquariumId = await aquariumService.create(device.db, {
    name: 'Meu', type: 'brackish', volume: 50, length: null, width: null, height: null,
    setupDate: null, targetTemperature: null, description: null, imageUri: 'aquarium-images/x.jpg',
  });
  await organismService.add(
    device.db,
    aquariumId,
    { kind: 'custom', species: { commonName: 'Molinésia', scientificName: null, category: 'fish', waterType: 'brackish' } },
    { quantity: 3, addedAt: null, notes: null, imageUri: 'aquarium-images/molinesia.jpg' },
  );
  await maintenanceService.create(device.db, {
    aquariumId, title: 'TPA', category: 'water_change', description: null, frequency: 'weekly',
    scheduledAt: new Date(Date.now() + 86_400_000).toISOString(), reminderEnabled: true,
  });
  return device;
}

test('backup e restauração em outro aparelho preservam os dados', async () => {
  const source = await populatedDevice();
  const backup = await backupService.createBackup(source.db);
  const text = JSON.stringify(backup);

  const target = createTestDatabase();
  await initializeDatabase(target.db);
  notifications.scheduled.clear();
  await backupService.restore(target.db, backupService.parse(text));

  for (const table of TABLES) assert.equal(count(target.raw, table), count(source.raw, table), table);
  assert.equal(count(target.raw, 'species WHERE is_custom = 1'), 1, 'espécie manual restaurada');
  assert.equal(count(target.raw, 'aquariums WHERE is_demo = 1'), 2, 'marca de exemplo preservada');
  assert.equal(count(target.raw, 'aquariums WHERE image_uri IS NOT NULL'), 0, 'fotos não viajam no backup');
  assert.equal(count(source.raw, 'aquarium_species WHERE image_uri IS NOT NULL'), 1, 'foto do organismo salva');
  assert.equal(count(target.raw, 'aquarium_species WHERE image_uri IS NOT NULL'), 0, 'foto do organismo não viaja');
  assert.equal(notifications.scheduled.size, 1, 'lembrete reagendado no novo aparelho');
});

test('restaurar substitui os dados atuais', async () => {
  const source = await populatedDevice();
  const backup = await backupService.createBackup(source.db);

  const target = await populatedDevice();
  await demoDataService.remove(target.db);
  await aquariumService.create(target.db, {
    name: 'Será apagado', type: 'freshwater', volume: 10, length: null, width: null, height: null,
    setupDate: null, targetTemperature: null, description: null, imageUri: null,
  });
  await backupService.restore(target.db, backup);

  const names = (target.raw.prepare('SELECT name FROM aquariums ORDER BY name').all() as { name: string }[]).map((r) => r.name);
  assert.ok(!names.includes('Será apagado'));
  assert.equal(names.length, 3);
});

test('backup com dado inválido não altera nada', async () => {
  const device = await populatedDevice();
  const before = TABLES.map((table) => count(device.raw, table));
  const backup = await backupService.createBackup(device.db);
  backup.data.parameter_records.push({ ...backup.data.parameter_records[0], id: 'x', aquarium_id: 'inexistente' });

  await assert.rejects(() => backupService.restore(device.db, backup), BackupError);
  assert.deepEqual(TABLES.map((table) => count(device.raw, table)), before);
});

test('validação do arquivo', async () => {
  const device = await populatedDevice();
  const backup = await backupService.createBackup(device.db);

  assert.throws(() => backupService.parse('não é json'), /JSON válido/);
  assert.throws(() => backupService.parse(JSON.stringify({ ...backup, app: 'outro' })), /não é um backup do AquaTrack/);
  assert.throws(() => backupService.parse(JSON.stringify({ ...backup, schemaVersion: 999 })), /versão mais nova/);
  assert.throws(() => backupService.parse(JSON.stringify({ ...backup, data: {} })), /incompleto/);

  // Backup sem uma coluna (como viria de uma versão anterior) usa o valor padrão do schema.
  const old = structuredClone(backup);
  for (const row of old.data.aquariums) delete row.is_demo;
  const target = createTestDatabase();
  await initializeDatabase(target.db);
  await backupService.restore(target.db, backupService.parse(JSON.stringify(old)));
  assert.equal(count(target.raw, 'aquariums WHERE is_demo = 0'), 3);
});
