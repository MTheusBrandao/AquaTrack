import assert from 'node:assert/strict';
import { test } from 'node:test';

import { createTestDatabase } from './helpers/db.mts';

const src = (path: string) => new URL(`../src/${path}`, import.meta.url).href;
const { initializeDatabase } = await import(src('database/database.ts'));
const { aquariumService } = await import(src('features/aquariums/services/aquariumService.ts'));
const { equipmentService } = await import(src('features/equipment/services/equipmentService.ts'));
const { maintenanceService } = await import(src('features/maintenance/services/maintenanceService.ts'));
const { backupService } = await import(src('features/backup/services/backupService.ts'));

const aquariumInput = {
  name: 'A', type: 'freshwater', volume: 60, length: null, width: null, height: null,
  setupDate: null, targetTemperature: null, description: null, imageUri: null,
};
const equipmentInput = (aquariumId: string) => ({
  aquariumId, name: 'Filtro', category: 'filter', brand: null, model: null,
  powerWatts: 10, installedAt: null, notes: null,
});
const taskInput = (aquariumId: string, equipmentId: string | null) => ({
  aquariumId, title: 'Limpar filtro', category: 'filter_cleaning', description: null,
  frequency: 'monthly', scheduledAt: new Date(Date.now() + 86_400_000).toISOString(),
  reminderEnabled: false, equipmentId,
});

async function setup() {
  const { db, raw } = createTestDatabase();
  await initializeDatabase(db);
  const a1 = await aquariumService.create(db, aquariumInput);
  const a2 = await aquariumService.create(db, { ...aquariumInput, name: 'B' });
  return { db, raw, a1, a2 };
}

test('tarefa vinculada a equipamento e desvinculada ao excluí-lo', async () => {
  const { db, a1 } = await setup();
  const equipmentId = await equipmentService.create(db, equipmentInput(a1));
  const taskId = await maintenanceService.create(db, taskInput(a1, equipmentId));

  const task = await maintenanceService.get(db, taskId);
  assert.equal(task.equipmentName, 'Filtro');
  assert.equal((await equipmentService.getDetails(db, equipmentId)).tasks.length, 1);
  assert.equal((await aquariumService.getDetails(db, a1)).equipment.length, 1);

  await equipmentService.remove(db, equipmentId);
  const after = await maintenanceService.get(db, taskId);
  assert.ok(after, 'a tarefa continua existindo');
  assert.equal(after.equipmentId, null);
});

test('equipamento de outro aquário não é vinculado', async () => {
  const { db, a1, a2 } = await setup();
  const otherEquipment = await equipmentService.create(db, equipmentInput(a2));
  const taskId = await maintenanceService.create(db, taskInput(a1, otherEquipment));
  assert.equal((await maintenanceService.get(db, taskId)).equipmentId, null);
});

test('editar não move o equipamento de aquário', async () => {
  const { db, a1, a2 } = await setup();
  const equipmentId = await equipmentService.create(db, equipmentInput(a1));
  await equipmentService.update(db, equipmentId, { ...equipmentInput(a2), name: 'Filtro novo' });
  const details = await equipmentService.getDetails(db, equipmentId);
  assert.equal(details.equipment.aquariumId, a1);
  assert.equal(details.equipment.name, 'Filtro novo');
});

test('excluir aquário remove seus equipamentos; backup leva equipamentos', async () => {
  const { db, raw, a1, a2 } = await setup();
  const equipmentId = await equipmentService.create(db, equipmentInput(a1));
  await maintenanceService.create(db, taskInput(a1, equipmentId));
  await equipmentService.create(db, equipmentInput(a2));

  const backup = await backupService.createBackup(db);
  assert.equal(backup.data.equipment.length, 2);

  await aquariumService.remove(db, a2);
  assert.equal((raw.prepare('SELECT COUNT(*) AS n FROM equipment').get() as { n: number }).n, 1);

  // Restaurar o backup completo e um "antigo", sem a tabela de equipamentos.
  await backupService.restore(db, backupService.parse(JSON.stringify(backup)));
  assert.equal((raw.prepare('SELECT COUNT(*) AS n FROM equipment').get() as { n: number }).n, 2);
  const linked = raw.prepare('SELECT COUNT(*) AS n FROM maintenance_tasks WHERE equipment_id IS NOT NULL').get() as { n: number };
  assert.equal(linked.n, 1, 'vínculo restaurado');

  const old = structuredClone(backup);
  delete (old.data as Record<string, unknown>).equipment;
  for (const task of old.data.maintenance_tasks) delete task.equipment_id;
  await backupService.restore(db, backupService.parse(JSON.stringify({ ...old, schemaVersion: 4 })));
  assert.equal((raw.prepare('SELECT COUNT(*) AS n FROM equipment').get() as { n: number }).n, 0);
});
