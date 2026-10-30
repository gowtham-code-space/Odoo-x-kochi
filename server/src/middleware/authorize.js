import { ForbiddenError } from '../errors/HttpErrors.js';
import { ROLE_HIERARCHY } from '../constants/roles.js';

/**
 * Role-based authorization middleware factory.
 *
 * Usage:
 *   router.delete('/:id', authenticate, resolveTenant, authorize('OWNER', 'ADMIN'), handler)
 *
 * Must be used AFTER resolveTenant (which attaches req.membership).
 *
 * @param {...string} allowedRoles - Roles permitted to access the route
 */
export function authorize(...allowedRoles) {
  return (req, _res, next) => {
    const userRole = req.membership?.role;

    if (!userRole || !allowedRoles.includes(userRole)) {
      throw new ForbiddenError(
        `This action requires one of the following roles: ${allowedRoles.join(', ')}`
      );
    }

    next();
  };
}

/**
 * Minimum-role authorization — allows the role and any higher privilege role.
 * authorize.atLeast('ADMIN') allows ADMIN and OWNER.
 */
authorize.atLeast = function (minimumRole) {
  return (req, _res, next) => {
    const userRole = req.membership?.role;
    const userLevel = ROLE_HIERARCHY.indexOf(userRole);
    const requiredLevel = ROLE_HIERARCHY.indexOf(minimumRole);

    if (userLevel < requiredLevel) {
      throw new ForbiddenError(`This action requires at least ${minimumRole} role`);
    }

    next();
  };
};

