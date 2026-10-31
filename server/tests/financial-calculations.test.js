import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateLine, percentageOf, toPaise } from '../src/utils/money.js';
import { nextBillingDate } from '../src/utils/billing.js';
import { evaluateDiscount } from '../src/utils/discounts.js';

test('money calculations retain paisa precision without floating point drift', () => {
  assert.equal(toPaise('0.10') + toPaise('0.20'), 30n);
  assert.equal(percentageOf(999n, 18), 180n);
  assert.deepEqual(
    calculateLine({ quantity: 3, unitPrice: '99.99', discountPct: 10, taxRate: 18 }),
    { subtotal: '269.97', taxAmount: '48.59', total: '318.56' }
  );
});

test('billing date supports every declared billing frequency', () => {
  const start = new Date('2026-01-01T00:00:00.000Z');
  assert.equal(nextBillingDate(start, 'DAILY').toISOString(), '2026-01-02T00:00:00.000Z');
  assert.equal(nextBillingDate(start, 'WEEKLY').toISOString(), '2026-01-08T00:00:00.000Z');
  assert.equal(nextBillingDate(start, 'MONTHLY').toISOString(), '2026-02-01T00:00:00.000Z');
  assert.equal(nextBillingDate(start, 'QUARTERLY').toISOString(), '2026-04-01T00:00:00.000Z');
  assert.equal(nextBillingDate(start, 'SEMI_ANNUAL').toISOString(), '2026-07-01T00:00:00.000Z');
  assert.equal(nextBillingDate(start, 'ANNUAL').toISOString(), '2027-01-01T00:00:00.000Z');
});

test('discount eligibility enforces product and per-customer limits', () => {
  const discount = {
    isActive: true,
    type: 'PERCENTAGE',
    value: 10,
    maxUses: 10,
    usedCount: 2,
    maxUsesPerCustomer: 1,
    productId: 'product-a',
  };
  assert.deepEqual(
    evaluateDiscount(discount, { amount: '100.00', quantity: 1, productId: 'product-a', customerId: 'customer-a', customerUses: 0 }),
    { amount: '10.00', eligible: true, reason: null }
  );
  assert.equal(
    evaluateDiscount(discount, { amount: '100.00', quantity: 1, productId: 'product-b', customerId: 'customer-a', customerUses: 0 }).eligible,
    false
  );
  assert.equal(
    evaluateDiscount(discount, { amount: '100.00', quantity: 1, productId: 'product-a', customerId: 'customer-a', customerUses: 1 }).eligible,
    false
  );
});
