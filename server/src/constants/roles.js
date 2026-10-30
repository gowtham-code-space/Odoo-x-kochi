export const ROLES = {
  OWNER: 'OWNER',
  ADMIN: 'ADMIN',
  MEMBER: 'MEMBER',
};

// Role hierarchy — higher index = more privilege
export const ROLE_HIERARCHY = [ROLES.MEMBER, ROLES.ADMIN, ROLES.OWNER];

/**
 * Check if a given role has at least the required minimum role level.
 */
export function hasMinimumRole(userRole, requiredRole) {
  return ROLE_HIERARCHY.indexOf(userRole) >= ROLE_HIERARCHY.indexOf(requiredRole);
}

