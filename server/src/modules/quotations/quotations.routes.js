import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import { resolveTenant } from '../../middleware/resolveTenant.js';
import { validateRequest } from '../../middleware/validateRequest.js';
import { createQuotationSchema, updateQuotationSchema } from './quotations.validation.js';
import * as controller from './quotations.controller.js';

const router = Router({ mergeParams: true });
router.use(authenticate, resolveTenant);
router.get('/', authorize('ADMIN', 'STAFF'), controller.handleListQuotations);
router.get('/:id', authorize('ADMIN', 'STAFF'), controller.handleGetQuotation);
router.post('/', authorize('ADMIN', 'STAFF'), validateRequest({ body: createQuotationSchema }), controller.handleCreateQuotation);
router.patch('/:id', authorize('ADMIN', 'STAFF'), validateRequest({ body: updateQuotationSchema }), controller.handleUpdateQuotation);
router.post('/:id/send', authorize('ADMIN', 'STAFF'), controller.handleSendQuotation);
router.post('/:id/accept', authorize('ADMIN', 'STAFF'), controller.handleAcceptQuotation);
router.post('/:id/reject', authorize('ADMIN', 'STAFF'), controller.handleRejectQuotation);
router.post('/:id/cancel', authorize('ADMIN', 'STAFF'), controller.handleCancelQuotation);

export default router;
