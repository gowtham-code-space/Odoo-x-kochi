/**
 * Role constants for subscription management system.
 * ADMIN  — Full access: manage products, plans, invoices, discounts, users
 * STAFF  — Operational: manage subscriptions, quotations, payments; read finance
 * CUSTOMER — Self-service: view own subscriptions, invoices, pay bills
 */

export const ROLES = {
  ADMIN:    'ADMIN',
  STAFF:    'STAFF',
  CUSTOMER: 'CUSTOMER',
};

// Role hierarchy — higher index = more privilege
export const ROLE_HIERARCHY = [ROLES.CUSTOMER, ROLES.STAFF, ROLES.ADMIN];

/**
 * Check if a given role has at least the required minimum role level.
 */
export function hasMinimumRole(userRole, requiredRole) {
  return ROLE_HIERARCHY.indexOf(userRole) >= ROLE_HIERARCHY.indexOf(requiredRole);
}
