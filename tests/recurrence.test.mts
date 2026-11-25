import assert from 'node:assert/strict';

const r = await import(new URL('../src/features/maintenance/utils/recurrence.ts', import.meta.url).href);
const p = await import(new URL('../src/features/monitoring/utils/parameterStatus.ts', import.meta.url).href);

const d = (y: number, m: number, day: number, h = 9, min = 0) => new Date(y, m - 1, day, h, min);
const iso = (x: Date) => `${x.getFullYear()}-${x.getMonth() + 1}-${x.getDate()} ${x.getHours()}:${x.getMinutes()}`;

// Mensal sem deriva: 31/01 → 28/02 → 31/03 → 30/04
const anchor = d(2026, 1, 31);
assert.equal(iso(r.occurrenceAt(anchor, 'monthly', 1)), '2026-2-28 9:0');
assert.equal(iso(r.occurrenceAt(anchor, 'monthly', 2)), '2026-3-31 9:0');
assert.equal(iso(r.occurrenceAt(anchor, 'monthly', 3)), '2026-4-30 9:0');
assert.equal(iso(r.occurrenceAt(anchor, 'monthly', 12)), '2027-1-31 9:0');
// Ano bissexto
assert.equal(iso(r.occurrenceAt(d(2027, 1, 31), 'monthly', 13)), '2028-2-29 9:0');

// Concluída em dia: próxima ocorrência
assert.equal(iso(r.nextAfterCompletion(anchor, 'monthly', d(2026, 2, 28), d(2026, 2, 28, 10))), '2026-3-31 9:0');
// Concluída antes do prazo: ainda vai para a seguinte à atual
assert.equal(iso(r.nextAfterCompletion(d(2026, 11, 1), 'weekly', d(2026, 11, 8), d(2026, 11, 6))), '2026-11-15 9:0');
// Concluída com 3 semanas de atraso: pula as perdidas
assert.equal(iso(r.nextAfterCompletion(d(2026, 11, 1), 'weekly', d(2026, 11, 8), d(2026, 11, 30, 12))), '2026-12-6 9:0');
// Diária, mantendo o horário
assert.equal(iso(r.nextAfterCompletion(d(2026, 11, 24, 20, 30), 'daily', d(2026, 11, 24, 20, 30), d(2026, 11, 24, 21))), '2026-11-25 20:30');
// Quinzenal atravessando o ano
assert.equal(iso(r.nextOccurrence(d(2026, 12, 20), 'biweekly', d(2026, 12, 25))), '2027-1-3 9:0');
// Âncora no futuro com after anterior
assert.equal(iso(r.nextOccurrence(d(2026, 12, 1), 'weekly', d(2026, 12, 1))), '2026-12-8 9:0');

// Status derivado
const now = d(2026, 11, 24, 12);
assert.equal(r.getMaintenanceStatus({ scheduledAt: d(2026, 11, 24, 9).toISOString(), completedAt: null }, now), 'overdue');
assert.equal(r.getMaintenanceStatus({ scheduledAt: d(2026, 11, 25).toISOString(), completedAt: null }, now), 'pending');
assert.equal(r.getMaintenanceStatus({ scheduledAt: d(2026, 11, 1).toISOString(), completedAt: 'x' }, now), 'completed');

// Status de parâmetros: zero é valor medido; faixa só de máximo
const ammonia = { parameterId: 'ammonia', minValue: 0, maxValue: 0, description: null };
assert.equal(p.getParameterStatus(0, ammonia), 'in_range');
assert.equal(p.getParameterStatus(0.25, ammonia), 'out_of_range');
assert.equal(p.getParameterStatus(5, { parameterId: 'gh', minValue: null, maxValue: null, description: null }), 'no_reference');
assert.equal(p.formatReferenceRange({ parameterId: 'ph', minValue: 6.5, maxValue: 7.8, description: null }, 1, 'pH'), '6,5 a 7,8 pH');

console.log('OK: recorrência e status');
