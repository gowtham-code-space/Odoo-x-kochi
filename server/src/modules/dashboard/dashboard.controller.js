import { getDashboardStats, getOrganizationDashboard } from './dashboard.service.js';

export async function handleGetDashboard(req, res) {
  const data = await getDashboardStats(req.user.id);
  res.json({ success: true, data });
}

export async function handleGetOrganizationDashboard(req, res) {
  const data = await getOrganizationDashboard(req.organization.id, req.membership.role, req.user.id);
  res.json({ success: true, data });
}

