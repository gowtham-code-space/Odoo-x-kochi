import { listBillingRuns, runRecurringBilling } from '../invoices/invoices.service.js';

export async function handleRunBilling(req, res) {
  const run = await runRecurringBilling(new Date(), req.organization.id);
  res.json({ success: true, data: { run } });
}

export async function handleListBillingRuns(req, res) {
  const { page, limit } = req.query;
  const data = await listBillingRuns(req.organization.id, {
    page: Math.max(Number.parseInt(page, 10) || 1, 1),
    limit: Math.min(Math.max(Number.parseInt(limit, 10) || 20, 1), 100),
  });
  res.json({ success: true, data });
}
