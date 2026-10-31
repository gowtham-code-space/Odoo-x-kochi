import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import { resolveTenant } from '../../middleware/resolveTenant.js';
import { validateRequest } from '../../middleware/validateRequest.js';
import { initiatePaymentSchema, recordPaymentSchema } from './payments.validation.js';
import * as controller from './payments.controller.js';

const router = Router({ mergeParams: true });
router.use(authenticate, resolveTenant);
router.get('/', authorize('ADMIN', 'STAFF'), controller.handleListPayments);
router.get('/:id', authorize('ADMIN', 'STAFF'), controller.handleGetPayment);
router.post('/record', authorize('ADMIN', 'STAFF'), validateRequest({ body: recordPaymentSchema }), controller.handleRecordPayment);
router.post('/initiate', authorize('ADMIN', 'STAFF', 'CUSTOMER'), validateRequest({ body: initiatePaymentSchema }), controller.handleInitiatePayment);

export default router;
