import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { resolveTenant } from '../../middleware/resolveTenant.js';
import { authorize } from '../../middleware/authorize.js';
import { validateRequest } from '../../middleware/validateRequest.js';
import { createPlanSchema, updatePlanSchema } from './plans.validation.js';
import {
  handleListPlans,
  handleGetPlan,
  handleCreatePlan,
  handleUpdatePlan,
  handleArchivePlan,
  handleActivatePlan,
} from './plans.controller.js';

const router = Router({ mergeParams: true });

router.use(authenticate, resolveTenant);

router.get('/', authorize('ADMIN', 'STAFF'), handleListPlans);
router.get('/:id', authorize('ADMIN', 'STAFF'), handleGetPlan);
router.post('/', authorize('ADMIN', 'STAFF'), validateRequest({ body: createPlanSchema }), handleCreatePlan);
router.patch('/:id', authorize('ADMIN', 'STAFF'), validateRequest({ body: updatePlanSchema }), handleUpdatePlan);
router.post('/:id/archive', authorize('ADMIN'), handleArchivePlan);
router.post('/:id/activate', authorize('ADMIN', 'STAFF'), handleActivatePlan);

export default router;
