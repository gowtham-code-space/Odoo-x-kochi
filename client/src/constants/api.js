export const API_ENDPOINTS = {
  // Auth
  AUTH_REGISTER: '/auth/register',
  AUTH_LOGIN: '/auth/login',
  AUTH_LOGOUT: '/auth/logout',
  AUTH_ME: '/auth/me',

  // Organizations
  ORGANIZATIONS: '/organizations',
  ORGANIZATION: (id) => `/organizations/${id}`,
  ORGANIZATION_SWITCH: (id) => `/organizations/${id}/switch`,

  // Dashboard
  DASHBOARD: '/dashboard',

  // Analytics
  ANALYTICS_QUERY: '/analytics/query',
  ANALYTICS_HISTORY: '/analytics/history',

  // AI
  AI_STATUS: '/ai/status',

  // System
  HEALTH: '/health',
};

