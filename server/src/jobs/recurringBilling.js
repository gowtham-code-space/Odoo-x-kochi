import { runRecurringBilling } from '../modules/invoices/invoices.service.js';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

let timer = null;
let activeRun = false;

export async function executeScheduledBilling() {
  if (activeRun) {
    logger.info('Skipping overlapping scheduled billing run');
    return null;
  }
  activeRun = true;
  try {
    const run = await runRecurringBilling();
    logger.info('Scheduled billing run completed', {
      runId: run.id,
      processed: run.subscriptionsProcessed,
      invoicesCreated: run.invoicesCreated,
      status: run.status,
    });
    return run;
  } catch (error) {
    logger.error('Scheduled billing run failed', { message: error.message });
    throw error;
  } finally {
    activeRun = false;
  }
}

export function startRecurringBillingScheduler() {
  if (!env.BILLING_SCHEDULER_ENABLED || timer) return null;
  const intervalMs = env.BILLING_SCHEDULER_INTERVAL_MINUTES * 60 * 1000;
  timer = setInterval(() => {
    executeScheduledBilling().catch(() => undefined);
  }, intervalMs);
  timer.unref?.();
  logger.info('Recurring billing scheduler enabled', { intervalMinutes: env.BILLING_SCHEDULER_INTERVAL_MINUTES });
  return timer;
}

export function stopRecurringBillingScheduler() {
  if (timer) clearInterval(timer);
  timer = null;
}
