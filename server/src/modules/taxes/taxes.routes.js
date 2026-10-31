import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import { resolveTenant } from '../../middleware/resolveTenant.js';
import { validateRequest } from '../../middleware/validateRequest.js';
import { createTaxSchema, updateTaxSchema } from './taxes.validation.js';
import * as controller from './taxes.controller.js';

const router = Router({ mergeParams: true });
router.use(authenticate, resolveTenant);
router.get('/', authorize('ADMIN', 'STAFF'), controller.handleListTaxes);
router.get('/:id', authorize('ADMIN', 'STAFF'), controller.handleGetTax);
router.post('/', authorize('ADMIN'), validateRequest({ body: createTaxSchema }), controller.handleCreateTax);
router.patch('/:id', authorize('ADMIN'), validateRequest({ body: updateTaxSchema }), controller.handleUpdateTax);
router.delete('/:id', authorize('ADMIN'), controller.handleDeactivateTax);

export default router;
