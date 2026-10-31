import { NotFoundError } from '../../errors/HttpErrors.js';
import { prisma } from '../../config/database.js';

export async function handleListNotifications(req, res) {
  const { page = '1', limit = '20', unreadOnly } = req.query;
  const take = Math.min(Math.max(Number.parseInt(limit, 10) || 20, 1), 100);
  const skip = (Math.max(Number.parseInt(page, 10) || 1, 1) - 1) * take;
  const where = {
    organizationId: req.organization.id,
    OR: [{ userId: req.user.id }, { userId: null }],
    ...(unreadOnly === 'true' ? { readAt: null } : {}),
  };
  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take }),
    prisma.notification.count({ where }),
  ]);
  res.json({ success: true, data: { notifications, total, page: Math.floor(skip / take) + 1, limit: take } });
}

export async function handleMarkRead(req, res) {
  const notification = await prisma.notification.findFirst({
    where: { id: req.params.id, organizationId: req.organization.id, OR: [{ userId: req.user.id }, { userId: null }] },
  });
  if (!notification) throw new NotFoundError('Notification not found');
  const updated = await prisma.notification.update({ where: { id: notification.id }, data: { readAt: new Date() } });
  res.json({ success: true, data: { notification: updated } });
}
