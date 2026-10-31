import { prisma } from '../config/database.js';

/**
 * Stores an in-app notification. Delivery channels (email, SMS, push) are
 * deliberately separate integrations; this function never leaks secrets.
 */
export async function createOrganizationNotification({ organizationId, userId, type, title, body, metadata }) {
  return prisma.notification.create({
    data: { organizationId, userId, type, title, body, metadata },
  });
}
