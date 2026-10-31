import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { resolveTenant } from '../../middleware/resolveTenant.js';
import { authorize } from '../../middleware/authorize.js';
import { handleGetDashboard, handleGetOrganizationDashboard } from './dashboard.controller.js';

const router = Router();

router.use(authenticate);
router.get('/', handleGetDashboard);
router.get('/organizations/:organizationId', resolveTenant, authorize('ADMIN', 'STAFF'), handleGetOrganizationDashboard);

export default router;

