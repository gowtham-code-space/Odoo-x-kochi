import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import { resolveTenant } from '../../middleware/resolveTenant.js';
import { handleListBillingRuns, handleRunBilling } from './billing.controller.js';

const router = Router({ mergeParams: true });
router.use(authenticate, resolveTenant, authorize('ADMIN'));
router.get('/runs', handleListBillingRuns);
router.post('/run', handleRunBilling);

export default router;
