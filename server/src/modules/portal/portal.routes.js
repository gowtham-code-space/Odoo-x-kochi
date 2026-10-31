import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import { resolveTenant } from '../../middleware/resolveTenant.js';
import { validateRequest } from '../../middleware/validateRequest.js';
import { cancellationRequestSchema, updateBillingProfileSchema } from './portal.validation.js';
import * as controller from './portal.controller.js';

const router = Router({ mergeParams: true });
router.use(authenticate, resolveTenant, authorize('CUSTOMER'));
router.get('/', controller.handleGetPortal);
router.patch('/billing-profile', validateRequest({ body: updateBillingProfileSchema }), controller.handleUpdateBillingProfile);
router.post('/subscriptions/:subscriptionId/cancellation-requests', validateRequest({ body: cancellationRequestSchema }), controller.handleCancellationRequest);

export default router;
