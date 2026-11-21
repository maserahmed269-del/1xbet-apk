import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateElapsedForMultiplier,
  calculateMultiplier,
  calculatePayout,
  formatEGP,
  generateCrashPoint,
  validateBet,
  validateDeposit,
  validateWithdraw,
} from './crashEngine';

test('generateCrashPoint stays within safe bounds', () => {
  assert.ok(generateCrashPoint(() => 0.001) >= 1.15);
  assert.ok(generateCrashPoint(() => 0.5) >= 1.25);
  assert.ok(generateCrashPoint(() => 0.9999) <= 25);
});

test('multiplier curve starts at 1.00x and grows monotonically', () => {
  assert.equal(calculateMultiplier(0), 1.0);
  const m2 = calculateMultiplier(2);
  const m5 = calculateMultiplier(5);
  const m10 = calculateMultiplier(10);
  assert.ok(m2 > 1.0);
  assert.ok(m5 > m2);
  assert.ok(m10 > m5);
  const roundTrip = calculateElapsedForMultiplier(m5);
  assert.ok(Math.abs(roundTrip - 5) < 0.08);
});

test('calculatePayout rounds to 2 decimals', () => {
  assert.equal(calculatePayout(100, 2.45), 245);
  assert.equal(calculatePayout(33.33, 1.5), 50);
  assert.equal(calculatePayout(0, 2), 0);
});

test('validateBet enforces zero balance rejection', () => {
  assert.equal(validateBet(20, 0).ok, false);
  assert.equal(validateBet(0, 500).ok, false);
  assert.equal(validateBet(100, 500).ok, true);
});

test('validateDeposit enforces 150 EGP min and screenshot requirement', () => {
  assert.equal(validateDeposit(100, true).ok, false);
  assert.equal(validateDeposit(200, false).ok, false);
  assert.equal(validateDeposit(150, true).ok, true);
  assert.equal(validateDeposit(200, true).ok, true);
});

test('validateWithdraw enforces account and balance', () => {
  assert.equal(validateWithdraw(100, 0, '01012345678').ok, false);
  assert.equal(validateWithdraw(40, 500, '01012345678').ok, false);
  assert.equal(validateWithdraw(200, 500, '123').ok, false);
  assert.equal(validateWithdraw(200, 500, '01012345678').ok, true);
});

test('formatEGP formats cleanly', () => {
  assert.equal(formatEGP(0), '0.00 ج.م');
  assert.equal(formatEGP(200), '200.00 ج.م');
});
