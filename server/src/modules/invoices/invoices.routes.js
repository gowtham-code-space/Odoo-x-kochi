import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import { resolveTenant } from '../../middleware/resolveTenant.js';
import { validateRequest } from '../../middleware/validateRequest.js';
import { createInvoiceSchema, updateInvoiceSchema } from './invoices.validation.js';
import * as controller from './invoices.controller.js';

const router = Router({ mergeParams: true });
router.use(authenticate, resolveTenant);
router.get('/', authorize('ADMIN', 'STAFF'), controller.handleListInvoices);
router.get('/:id', authorize('ADMIN', 'STAFF'), controller.handleGetInvoice);
router.post('/', authorize('ADMIN', 'STAFF'), validateRequest({ body: createInvoiceSchema }), controller.handleCreateInvoice);
router.patch('/:id', authorize('ADMIN', 'STAFF'), validateRequest({ body: updateInvoiceSchema }), controller.handleUpdateInvoice);
router.post('/:id/confirm', authorize('ADMIN', 'STAFF'), controller.handleConfirmInvoice);
router.post('/:id/cancel', authorize('ADMIN'), controller.handleCancelInvoice);
router.post('/billing/run', authorize('ADMIN'), controller.handleRunBilling);

export default router;
