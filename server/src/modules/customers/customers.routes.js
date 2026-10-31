import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import { resolveTenant } from '../../middleware/resolveTenant.js';
import { validateRequest } from '../../middleware/validateRequest.js';
import { createCustomerSchema, updateCustomerSchema } from './customers.validation.js';
import {
  handleCreateCustomer,
  handleGetCustomer,
  handleListCustomers,
  handleUpdateCustomer,
} from './customers.controller.js';

const router = Router({ mergeParams: true });
router.use(authenticate, resolveTenant);
router.get('/', authorize('ADMIN', 'STAFF'), handleListCustomers);
router.get('/:id', authorize('ADMIN', 'STAFF'), handleGetCustomer);
router.post('/', authorize('ADMIN', 'STAFF'), validateRequest({ body: createCustomerSchema }), handleCreateCustomer);
router.patch('/:id', authorize('ADMIN', 'STAFF'), validateRequest({ body: updateCustomerSchema }), handleUpdateCustomer);

export default router;
