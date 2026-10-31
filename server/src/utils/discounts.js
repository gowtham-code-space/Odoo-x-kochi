import { fromPaise, percentageOf, toPaise } from './money.js';

/**
 * Validates and computes a discount in paise.  The caller must still persist
 * the redemption in the same transaction as its invoice.
 */
export function evaluateDiscount(discount, { amount, quantity, productId, customerId, now = new Date(), customerUses = 0 }) {
  if (!discount || !discount.isActive) return { amount: '0.00', eligible: false, reason: 'Discount is inactive' };
  if (discount.validFrom && discount.validFrom > now) return { amount: '0.00', eligible: false, reason: 'Discount is not active yet' };
  if (discount.validUntil && discount.validUntil < now) return { amount: '0.00', eligible: false, reason: 'Discount has expired' };
  if (discount.maxUses !== null && discount.maxUses !== undefined && discount.usedCount >= discount.maxUses) {
    return { amount: '0.00', eligible: false, reason: 'Discount usage limit reached' };
  }
  if (discount.minAmount && toPaise(amount) < toPaise(discount.minAmount)) {
    return { amount: '0.00', eligible: false, reason: 'Minimum purchase amount not reached' };
  }
  if (discount.minQuantity && quantity < discount.minQuantity) {
    return { amount: '0.00', eligible: false, reason: 'Minimum quantity not reached' };
  }
  if (discount.productId && discount.productId !== productId) {
    return { amount: '0.00', eligible: false, reason: 'Discount is not applicable to this product' };
  }
  if (customerId && discount.maxUsesPerCustomer && customerUses >= discount.maxUsesPerCustomer) {
    return { amount: '0.00', eligible: false, reason: 'Customer usage limit reached' };
  }

  const total = toPaise(amount);
  const calculated = discount.type === 'PERCENTAGE' ? percentageOf(total, discount.value) : toPaise(discount.value);
  return { amount: fromPaise(calculated > total ? total : calculated), eligible: true, reason: null };
}
