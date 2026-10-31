import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { resolveTenant } from '../../middleware/resolveTenant.js';
import { handleListNotifications, handleMarkRead } from './notifications.controller.js';

const router = Router({ mergeParams: true });
router.use(authenticate, resolveTenant);
router.get('/', handleListNotifications);
router.post('/:id/read', handleMarkRead);

export default router;
