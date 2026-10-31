/**
 * Monetary values are calculated in paise using BigInt.  Database Decimal
 * values and API numbers are converted at the boundary, avoiding floating
 * point arithmetic in authoritative invoice and quotation calculations.
 */
const PAISA_PER_RUPEE = 100n;

export function toPaise(value) {
  const raw = String(value ?? 0).trim();
  if (!/^-?\d+(?:\.\d{1,2})?$/.test(raw)) {
    throw new TypeError('Invalid monetary value');
  }

  const negative = raw.startsWith('-');
  const [wholeRaw, fractionRaw = ''] = (negative ? raw.slice(1) : raw).split('.');
  const whole = BigInt(wholeRaw);
  const fraction = BigInt((fractionRaw + '00').slice(0, 2));
  const result = whole * PAISA_PER_RUPEE + fraction;
  return negative ? -result : result;
}

export function fromPaise(paise) {
  const value = typeof paise === 'bigint' ? paise : BigInt(paise);
  const negative = value < 0n;
  const absolute = negative ? -value : value;
  const formatted = `${absolute / PAISA_PER_RUPEE}.${String(absolute % PAISA_PER_RUPEE).padStart(2, '0')}`;
  return negative ? `-${formatted}` : formatted;
}

export function percentageOf(amountPaise, percentage) {
  const basisPoints = BigInt(Math.round(Number(percentage ?? 0) * 100));
  return (amountPaise * basisPoints + 5000n) / 10000n;
}

export function calculateLine({ quantity, unitPrice, discountPct = 0, taxRate = 0 }) {
  const quantityValue = BigInt(quantity);
  const gross = toPaise(unitPrice) * quantityValue;
  const discount = percentageOf(gross, discountPct);
  const subtotal = gross - discount;
  const taxAmount = percentageOf(subtotal, taxRate);
  return {
    subtotal: fromPaise(subtotal),
    taxAmount: fromPaise(taxAmount),
    total: fromPaise(subtotal + taxAmount),
  };
}

export function sumMoney(values) {
  return fromPaise(values.reduce((total, value) => total + toPaise(value), 0n));
}
