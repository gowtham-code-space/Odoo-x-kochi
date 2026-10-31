export function nextBillingDate(startDate, frequency) {
  const date = new Date(startDate);
  if (Number.isNaN(date.getTime())) throw new TypeError('Invalid billing date');

  switch (frequency) {
    case 'DAILY':
      date.setDate(date.getDate() + 1);
      break;
    case 'WEEKLY':
      date.setDate(date.getDate() + 7);
      break;
    case 'MONTHLY':
      date.setMonth(date.getMonth() + 1);
      break;
    case 'QUARTERLY':
      date.setMonth(date.getMonth() + 3);
      break;
    case 'SEMI_ANNUAL':
      date.setMonth(date.getMonth() + 6);
      break;
    case 'ANNUAL':
      date.setFullYear(date.getFullYear() + 1);
      break;
    default:
      throw new TypeError('Unsupported billing frequency');
  }
  return date;
}

export function isPlanAvailable(plan, at = new Date()) {
  return (
    plan.status === 'ACTIVE' &&
    plan.isActive &&
    (!plan.availableFrom || plan.availableFrom <= at) &&
    (!plan.availableUntil || plan.availableUntil >= at)
  );
}
