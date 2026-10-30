import { prisma } from '../config/database.js';
import { ForbiddenError, NotFoundError } from '../errors/HttpErrors.js';

/**
 * Tenant resolution middleware.
 * Reads :organizationId from route params, verifies the authenticated user
 * has an active membership in that organization via a DB query,
 * and attaches req.organization and req.membership to the request.
 *
 * SECURITY: This middleware NEVER trusts a client-supplied org ID without
 * independently verifying membership in the database.
 *
 * Must be used AFTER authenticate middleware.
 */
export async function resolveTenant(req, _res, next) {
  const { organizationId } = req.params;

  if (!organizationId) {
    throw new ForbiddenError('Organization context required');
  }

  const membership = await prisma.membership.findUnique({
    where: {
      userId_organizationId: {
        userId: req.user.id,
        organizationId,
      },
    },
    include: {
      organization: true,
    },
  });

  if (!membership) {
    // Return NotFound rather than Forbidden so we don't leak org existence
    throw new NotFoundError('Organization not found or access denied');
  }

  req.organization = membership.organization;
  req.membership = membership;
  next();
}

