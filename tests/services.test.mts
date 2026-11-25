// Services reais (manutenção, monitoramento, dados de exemplo e dashboard) com notificações simuladas.
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { createTestDatabase } from './helpers/db.mts';

const src = (path: string) => new URL(`../src/${path}`, import.meta.url).href;
const { initializeDatabase } = await import(src('database/database.ts'));
const { aquariumService } = await import(src('features/aquariums/services/aquariumService.ts'));
const { maintenanceService } = await import(src('features/maintenance/services/maintenanceService.ts'));
const { monitoringService } = await import(src('features/monitoring/services/monitoringService.ts'));
const { demoDataService } = await import(src('features/demo/services/demoDataService.ts'));
const { dashboardService } = await import(src('features/dashboard/services/dashboardService.ts'));
const notifications = await import(new URL('./stubs/expo-notifications.mjs', import.meta.url).href);

const aquariumInput = {
  name: 'Meu aquário',
  type: 'freshwater',
  volume: 80,
  length: null,
  width: null,
  height: null,
  setupDate: null,
  targetTemperature: null,
  description: null,
  imageUri: null,
};

async function setup() {
  const { raw, db } = createTestDatabase();
  await initializeDatabase(db);
  notifications.scheduled.clear();
  return { raw, db };
}

test('migrations chegam à versão mais recente', async () => {
  const { raw } = await setup();
  assert.equal((raw.prepare('PRAGMA user_version').get() as { user_version: number }).user_version, 5);
});

test('medição grava só os parâmetros preenchidos', async () => {
  const { db, raw } = await setup();
  const id = await aquariumService.create(db, aquariumInput);
  const values = { temperature: 26, ph: null, ammonia: 0, nitrite: null, nitrate: null, gh: null, kh: null };
  const saved = await monitoringService.addMeasurement(db, id, { measuredAt: new Date().toISOString(), notes: null, values });
  assert.equal(saved, 2);
  assert.equal((raw.prepare('SELECT COUNT(*) AS n FROM parameter_records').get() as { n: number }).n, 2);
  const empty = { ...values, temperature: null, ammonia: null };
  await assert.rejects(() => monitoringService.addMeasurement(db, id, { measuredAt: new Date().toISOString(), notes: null, values: empty }));
});

test('manutenção: lembrete agendado, reagendado ao concluir e cancelado ao excluir', async () => {
  const { db } = await setup();
  const aquariumId = await aquariumService.create(db, aquariumInput);
  const inTwoDays = new Date(Date.now() + 2 * 86_400_000).toISOString();
  const taskId = await maintenanceService.create(db, {
    aquariumId,
    title: 'TPA',
    category: 'water_change',
    description: null,
    frequency: 'weekly',
    scheduledAt: inTwoDays,
    reminderEnabled: true,
  });

  let task = await maintenanceService.get(db, taskId);
  const firstNotification = task.notificationId;
  assert.ok(firstNotification && notifications.scheduled.has(firstNotification));

  await maintenanceService.complete(db, taskId);
  task = await maintenanceService.get(db, taskId);
  assert.equal(task.completedAt, null, 'recorrente continua aberta');
  assert.ok(new Date(task.scheduledAt) > new Date(inTwoDays), 'avançou uma semana');
  assert.ok(!notifications.scheduled.has(firstNotification), 'lembrete antigo cancelado');
  assert.ok(notifications.scheduled.has(task.notificationId), 'novo lembrete agendado');
  assert.equal((await maintenanceService.getDetails(db, taskId)).logs.length, 1);

  await maintenanceService.remove(db, taskId);
  assert.equal(notifications.scheduled.size, 0);
});

test('tarefa única concluída sai das abertas', async () => {
  const { db } = await setup();
  const aquariumId = await aquariumService.create(db, aquariumInput);
  const taskId = await maintenanceService.create(db, {
    aquariumId,
    title: 'Trocar mídia',
    category: 'filter_cleaning',
    description: null,
    frequency: 'once',
    scheduledAt: new Date(Date.now() - 3_600_000).toISOString(),
    reminderEnabled: true,
  });
  assert.equal((await maintenanceService.get(db, taskId)).notificationId, null, 'horário passado não agenda');
  await maintenanceService.complete(db, taskId);
  assert.equal((await maintenanceService.getOverview(db)).open.length, 0);
});

test('dados de exemplo: carregar, resumir no dashboard e remover sem tocar nos dados do usuário', async () => {
  const { db } = await setup();
  const ownId = await aquariumService.create(db, aquariumInput);

  await demoDataService.load(db);
  await demoDataService.load(db); // idempotente
  let summary = await dashboardService.getSummary(db);
  assert.equal(summary.aquariums.length, 3);
  assert.equal(summary.aquariums.filter((item: { aquarium: { isDemo: boolean } }) => item.aquarium.isDemo).length, 2);
  assert.ok(summary.hasDemoData);
  assert.deepEqual(
    summary.attention.map((item: { parameter: { id: string } }) => item.parameter.id),
    ['nitrate'],
    'nitrato de 45 mg/L no plantado de exemplo',
  );
  assert.equal(summary.overdue.length, 1);
  assert.equal(summary.recentRecords.length, 5);
  assert.equal(notifications.scheduled.size, 0, 'exemplo não agenda notificações');

  await demoDataService.remove(db);
  summary = await dashboardService.getSummary(db);
  assert.deepEqual(summary.aquariums.map((item: { aquarium: { id: string } }) => item.aquarium.id), [ownId]);
  assert.equal(summary.recentRecords.length, 0);
  assert.equal(summary.hasDemoData, false);
});

test('parâmetros marinhos aparecem só onde se aplicam', async () => {
  const { db } = await setup();
  const ids = async (type: string) => {
    const id = await aquariumService.create(db, { ...aquariumInput, type });
    const result = await monitoringService.getApplicableParameters(db, id);
    return result.parameters.map((parameter: { id: string }) => parameter.id);
  };
  const salt = await ids('saltwater');
  const fresh = await ids('freshwater');
  const brackish = await ids('brackish');

  for (const key of ['salinity', 'calcium', 'magnesium', 'phosphate']) assert.ok(salt.includes(key), key);
  assert.ok(!fresh.some((key: string) => ['salinity', 'calcium', 'magnesium', 'phosphate'].includes(key)));
  assert.ok(brackish.includes('salinity') && !brackish.includes('calcium'));

  const reef = await demoDataService.load(db).then(() => dashboardService.getSummary(db));
  const reefSummary = reef.aquariums.find((item: { aquarium: { type: string; isDemo: boolean } }) => item.aquarium.type === 'saltwater' && item.aquarium.isDemo);
  assert.equal(reefSummary.attentionCount, 0, 'exemplo marinho dentro das faixas');
});
