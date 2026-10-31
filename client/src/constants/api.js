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

  // Product catalogue
  PRODUCTS: (organizationId) => `/organizations/${organizationId}/products`,
  PRODUCT: (organizationId, productId) => `/organizations/${organizationId}/products/${productId}`,
  PRODUCT_VARIANTS: (organizationId, productId) =>
    `/organizations/${organizationId}/products/${productId}/variants`,
  PRODUCT_VARIANT: (organizationId, productId, variantId) =>
    `/organizations/${organizationId}/products/${productId}/variants/${variantId}`,

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

