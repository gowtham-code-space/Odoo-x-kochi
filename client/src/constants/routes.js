export const ROUTES = {
  // Public
  HOME:               '/',
  LOGIN:              '/login',
  REGISTER:           '/register',
  FORGOT_PASSWORD:    '/forgot-password',
  RESET_PASSWORD:     '/reset-password',

  // App (protected)
  DASHBOARD:          '/dashboard',
  SUBSCRIPTIONS:      '/subscriptions',
  SUBSCRIPTION_NEW:   '/subscriptions/new',
  QUOTATIONS:         '/quotations',
  QUOTATION_NEW:      '/quotations/new',
  PRODUCTS:           '/products',
  PRODUCT_NEW:        '/products/new',
  PLANS:              '/plans',
  PLAN_NEW:           '/plans/new',
  DISCOUNTS:          '/discounts',
  DISCOUNT_NEW:       '/discounts/new',
  INVOICES:           '/invoices',
  PAYMENTS:           '/payments',
  SETTINGS:           '/settings',

  // Error pages
  NOT_FOUND:          '/404',
  UNAUTHORIZED:       '/unauthorized',
};
