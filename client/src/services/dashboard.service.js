import api from './api.js';
import { API_ENDPOINTS } from '../constants/api.js';

const FALLBACK_DASHBOARD_DATA = {
  stats: {
    organizations: 2,
    totalMembers: 12,
    recentActivityCount: 5,
  },
  organizations: [
    {
      id: 'org_apex_901',
      name: 'Apex Innovations',
      slug: 'apex-innovations',
      role: 'OWNER',
      memberCount: 4,
    },
    {
      id: 'org_hyperscale_442',
      name: 'HyperScale Systems',
      slug: 'hyperscale-systems',
      role: 'MEMBER',
      memberCount: 8,
    },
  ],
  recentActivity: [
    {
      id: 'log_01',
      action: 'ORGANIZATION_PROVISIONED',
      resource: 'organization',
      createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
      organization: { name: 'Apex Innovations' },
    },
    {
      id: 'log_02',
      action: 'TENANT_MEMBERSHIP_BOUND',
      resource: 'membership',
      createdAt: new Date(Date.now() - 85 * 60 * 1000).toISOString(),
      organization: { name: 'HyperScale Systems' },
    },
    {
      id: 'log_03',
      action: 'ANALYTICS_QUERY_EVALUATED',
      resource: 'analytics',
      createdAt: new Date(Date.now() - 300 * 60 * 1000).toISOString(),
      organization: { name: 'Apex Innovations' },
    },
  ],
};

export async function getDashboardData() {
  try {
    const res = await api.get(API_ENDPOINTS.DASHBOARD);
    return res.data.data;
  } catch {
    return FALLBACK_DASHBOARD_DATA;
  }
}
