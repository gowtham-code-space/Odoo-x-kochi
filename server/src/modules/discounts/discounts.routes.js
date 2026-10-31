import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import { resolveTenant } from '../../middleware/resolveTenant.js';
import { validateRequest } from '../../middleware/validateRequest.js';
import { discountSchema, updateDiscountSchema } from './discounts.validation.js';
import * as controller from './discounts.controller.js';

const router = Router({ mergeParams: true });
router.use(authenticate, resolveTenant);
router.get('/', authorize('ADMIN', 'STAFF'), controller.handleListDiscounts);
router.get('/:id', authorize('ADMIN', 'STAFF'), controller.handleGetDiscount);
router.post('/', authorize('ADMIN'), validateRequest({ body: discountSchema }), controller.handleCreateDiscount);
router.patch('/:id', authorize('ADMIN'), validateRequest({ body: updateDiscountSchema }), controller.handleUpdateDiscount);

export default router;
