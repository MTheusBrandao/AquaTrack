// Migração v1 → v2 sobre um banco já existente + repositories de parâmetros e manutenção.
import { DatabaseSync } from 'node:sqlite';
import assert from 'node:assert/strict';

const root = new URL('../src/database/', import.meta.url).href;
const { initializeDatabase } = await import(root + 'database.ts');
const initial = await import(root + 'migrations/001_initial.ts');
const { aquariumRepository } = await import(root + 'repositories/aquariumRepository.ts');
const { parameterRepository } = await import(root + 'repositories/parameterRepository.ts');
const { maintenanceRepository } = await import(root + 'repositories/maintenanceRepository.ts');
const { nextAfterCompletion } = await import(new URL('../src/features/maintenance/utils/recurrence.ts', import.meta.url).href);

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

// Simula o banco que já está no iPhone (versão 1, com dados).
raw.exec('PRAGMA foreign_keys = ON');
await initial.up(db);
raw.exec('PRAGMA user_version = 1');
const now = new Date().toISOString();
const base = { length: null, width: null, height: null, setupDate: null, targetTemperature: null, description: null, imageUri: null };
await aquariumRepository.insert(db, 'fresh', { ...base, name: 'Doce', type: 'freshwater', volume: 100 }, now);
await aquariumRepository.insert(db, 'salt', { ...base, name: 'Marinho', type: 'saltwater', volume: 200 }, now);

await initializeDatabase(db);
assert.equal((raw.prepare('PRAGMA user_version').get() as { user_version: number }).user_version, 4);
assert.equal((await aquariumRepository.listWithStats(db)).length, 2, 'dados da v1 preservados');

// Parâmetros aplicáveis por tipo
const freshParams = await parameterRepository.listApplicable(db, 'freshwater');
const saltParams = await parameterRepository.listApplicable(db, 'saltwater');
assert.deepEqual(freshParams.map((p: { id: string }) => p.id), ['temperature', 'ph', 'ammonia', 'nitrite', 'nitrate', 'gh', 'kh']);
assert.ok(!saltParams.some((p: { id: string }) => p.id === 'gh'), 'GH não se aplica a marinho');

// Medições, zero vs não medido, últimas duas
const rec = (id: string, parameterId: string, value: number, at: string) =>
  parameterRepository.insertRecord(db, { id, aquariumId: 'fresh', parameterId, value, measuredAt: at, notes: null }, now);
await rec('r1', 'ammonia', 0, '2026-11-20T12:00:00.000Z');
await rec('r2', 'ammonia', 0.25, '2026-11-22T12:00:00.000Z');
await rec('r3', 'ammonia', 0.5, '2026-11-24T12:00:00.000Z');
await rec('r4', 'ph', 7, '2026-11-24T12:00:00.000Z');
const latest = await parameterRepository.listLatestTwo(db, 'fresh');
assert.deepEqual(latest.map((r: { id: string }) => r.id), ['r3', 'r2', 'r4']);
assert.equal((await parameterRepository.listRecords(db, 'fresh', 'ammonia', null))[0].value, 0, 'zero gravado como zero');
assert.equal((await parameterRepository.listRecords(db, 'fresh', 'ammonia', '2026-11-21T00:00:00.000Z')).length, 2, 'filtro por período');
assert.equal((await parameterRepository.listRecords(db, 'fresh', 'nitrate', null)).length, 0, 'não medido = sem registro');

// Manutenção: criar, concluir recorrente (histórico + reagendamento), concluir única
const start = new Date(2026, 0, 31, 9).toISOString();
await maintenanceRepository.insert(db, 't1', { aquariumId: 'fresh', title: 'TPA', category: 'water_change', description: null, frequency: 'monthly', scheduledAt: start, reminderEnabled: true }, now);
let task = await maintenanceRepository.findById(db, 't1');
assert.equal(task.startsAt, start);
assert.equal(task.aquariumName, 'Doce');
const next = nextAfterCompletion(new Date(task.startsAt), 'monthly', new Date(task.scheduledAt), new Date(2026, 0, 31, 10));
await maintenanceRepository.insertLog(db, { id: 'l1', taskId: 't1', aquariumId: 'fresh', title: task.title, category: task.category, scheduledFor: task.scheduledAt, completedAt: now });
await maintenanceRepository.reschedule(db, 't1', next.toISOString(), now);
task = await maintenanceRepository.findById(db, 't1');
assert.equal(new Date(task.scheduledAt).getDate(), 28, 'fevereiro');
assert.equal(task.startsAt, start, 'âncora preservada');

await maintenanceRepository.insert(db, 't2', { aquariumId: 'salt', title: 'Filtro', category: 'filter_cleaning', description: null, frequency: 'once', scheduledAt: now, reminderEnabled: false }, now);
await maintenanceRepository.markCompleted(db, 't2', now);
assert.deepEqual((await maintenanceRepository.listOpen(db, null)).map((t: { id: string }) => t.id), ['t1']);

// Excluir tarefa mantém o histórico; excluir aquário remove tudo em cascata
await maintenanceRepository.remove(db, 't1');
const logs = await maintenanceRepository.listLogs(db, { limit: 10 });
assert.equal(logs.length, 1);
assert.equal(logs[0].taskId, null);
await maintenanceRepository.setNotificationId(db, 't2', 'notif-1');
assert.deepEqual(await maintenanceRepository.listNotificationIds(db, 'salt'), ['notif-1']);
await aquariumRepository.remove(db, 'fresh');
for (const table of ['parameter_records', 'maintenance_logs']) {
  assert.equal((raw.prepare(`SELECT COUNT(*) AS n FROM ${table} WHERE aquarium_id = 'fresh'`).get() as { n: number }).n, 0, table);
}
// CHECKs
await assert.rejects(() => maintenanceRepository.insert(db, 'bad', { aquariumId: 'salt', title: 'x', category: 'nope', description: null, frequency: 'weekly', scheduledAt: now, reminderEnabled: true }, now));

console.log('OK: migração v1→v2, parâmetros, medições e manutenção');
