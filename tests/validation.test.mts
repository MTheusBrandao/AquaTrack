import assert from 'node:assert/strict';
const v = await import(new URL('../src/utils/validation.ts', import.meta.url).href);
const f = await import(new URL('../src/utils/format.ts', import.meta.url).href);

const vol = v.requiredDecimal('Informe o volume.', { min: 1, max: 100000, unit: 'L' });
assert.equal(vol.parse('120,5'), 120.5);
assert.equal(vol.safeParse('').error.issues[0].message, 'Informe o volume.');
assert.equal(vol.safeParse('abc').success, false);
assert.equal(vol.safeParse('0').success, false);

const temp = v.optionalDecimal({ min: 0, max: 40, unit: '°C' });
assert.equal(temp.parse(''), null);
assert.equal(temp.parse('0'), 0); // zero é valor medido, diferente de vazio
assert.equal(temp.safeParse('41').success, false);

assert.equal(v.optionalPastDate.safeParse('2999-01-01').success, false);
assert.equal(v.optionalPastDate.parse(null), null);
assert.equal(f.toLocalDateString(new Date(2026, 10, 24, 23, 30)), '2026-11-24');
console.log('OK: validação e datas');

