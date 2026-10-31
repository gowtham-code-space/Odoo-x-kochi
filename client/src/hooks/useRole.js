import { useOrganization } from './useOrganization.js';
import { useAuth } from './useAuth.js';

const LEGACY_ROLE_MAP = { OWNER: 'ADMIN', MEMBER: 'CUSTOMER' };

export function useRole() {
  const { activeOrg } = useOrganization();
  const { user } = useAuth();
  const role = activeOrg?.memberships?.[0]?.role || user?.role || 'ADMIN';
  return LEGACY_ROLE_MAP[role] || role;
}

export function canManageCatalogue(role) {
  return role === 'ADMIN' || role === 'STAFF';
}

export function isAdmin(role) {
  return role === 'ADMIN';
}
