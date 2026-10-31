import api from './api.js';
import { API_ENDPOINTS } from '../constants/api.js';

export async function getDashboardData(organizationId) {
  const res = await api.get(API_ENDPOINTS.ORGANIZATION_DASHBOARD(organizationId));
  return res.data.data;
}
