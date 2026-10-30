/**
 * Format numbers with Indian numbering system (e.g., ₹2,49,999) as required by design.md
 */
export function formatIndianCurrency(amount) {
  if (amount === undefined || amount === null) return '₹0';
  const val = Number(amount);
  return '₹' + val.toLocaleString('en-IN');
}

export function formatNumber(num) {
  if (num === undefined || num === null) return '0';
  return Number(num).toLocaleString('en-IN');
}

