import { prisma } from '../config/database.js';

/** Records non-sensitive activity without allowing audit failures to break a transaction. */
export async function recordAudit({ organizationId, userId, action, resource, resourceId, metadata, ipAddress }) {
  return prisma.auditLog.create({
    data: { organizationId, userId, action, resource, resourceId, metadata, ipAddress },
  });
}
