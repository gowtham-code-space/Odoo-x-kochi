import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import { resolveTenant } from '../../middleware/resolveTenant.js';
import { validateRequest } from '../../middleware/validateRequest.js';
import { changePlanSchema, createSubscriptionSchema, renewSubscriptionSchema, updateSubscriptionSchema } from './subscriptions.validation.js';
import * as controller from './subscriptions.controller.js';

const router = Router({ mergeParams: true });
router.use(authenticate, resolveTenant);
router.get('/', authorize('ADMIN', 'STAFF'), controller.handleListSubscriptions);
router.get('/:id', authorize('ADMIN', 'STAFF'), controller.handleGetSubscription);
router.post('/', authorize('ADMIN', 'STAFF'), validateRequest({ body: createSubscriptionSchema }), controller.handleCreateSubscription);
router.patch('/:id', authorize('ADMIN', 'STAFF'), validateRequest({ body: updateSubscriptionSchema }), controller.handleUpdateSubscription);
router.post('/:id/activate', authorize('ADMIN', 'STAFF'), controller.handleActivateSubscription);
router.post('/:id/pause', authorize('ADMIN', 'STAFF'), controller.handlePauseSubscription);
router.post('/:id/resume', authorize('ADMIN', 'STAFF'), controller.handleResumeSubscription);
router.post('/:id/close', authorize('ADMIN', 'STAFF'), controller.handleCloseSubscription);
router.post('/:id/renew', authorize('ADMIN', 'STAFF'), validateRequest({ body: renewSubscriptionSchema }), controller.handleRenewSubscription);
router.post('/:id/change-plan', authorize('ADMIN', 'STAFF'), validateRequest({ body: changePlanSchema }), controller.handleChangePlan);

export default router;
