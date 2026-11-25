import assert from 'node:assert/strict';
import { test } from 'node:test';

const c = await import(new URL('../src/features/calculators/utils/calculators.ts', import.meta.url).href);

const close = (actual: number, expected: number, tolerance = 0.01) =>
  assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} ≠ ${expected}`);

test('volume e troca de água', () => {
  assert.equal(c.tankVolumeLiters(80, 35, 45), 126);
  assert.equal(c.waterChangeLiters(120, 30), 36);
});

test('porcentagem de troca para atingir um alvo', () => {
  // 40 → 20 mg/L repondo com água de 0 mg/L: 50%.
  assert.equal(c.waterChangePercentForTarget(40, 20, 0), 50);
  // Água nova com 5 mg/L: (40 − 20) / (40 − 5) ≈ 57,1%.
  close(c.waterChangePercentForTarget(40, 20, 5), 57.14);
  assert.equal(c.waterChangePercentForTarget(10, 20, 0), 0, 'já abaixo do alvo');
  assert.equal(c.waterChangePercentForTarget(40, 5, 5), null, 'alvo igual à água nova é inalcançável');
});

test('conversões', () => {
  close(c.degreesToPpm(1), 17.848, 0.0001);
  close(c.ppmToDegrees(178.48), 10);
  close(c.dkhToMeq(8.4), 3);
  assert.equal(c.celsiusToFahrenheit(25), 77);
  assert.equal(c.fahrenheitToCelsius(77), 25);
  close(c.salinityToSpecificGravity(35), 1.0264, 0.0001);
  close(c.specificGravityToSalinity(1.025), 33.2, 0.1);
});

test('diluição genérica', () => {
  // Elevar 10 mg/L em 100 L com estoque de 50 mg/mL: 20 mL.
  assert.equal(c.doseMilliliters(100, 10, 50), 20);
  assert.equal(c.doseMilliliters(100, 10, 0), null);
});
