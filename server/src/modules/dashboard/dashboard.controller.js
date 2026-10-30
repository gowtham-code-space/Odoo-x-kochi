import { getDashboardStats } from './dashboard.service.js';

export async function handleGetDashboard(req, res) {
  const data = await getDashboardStats(req.user.id);
  res.json({ success: true, data });
}

