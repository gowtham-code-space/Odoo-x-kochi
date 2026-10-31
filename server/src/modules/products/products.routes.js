import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { resolveTenant } from '../../middleware/resolveTenant.js';
import { authorize } from '../../middleware/authorize.js';
import { validateRequest } from '../../middleware/validateRequest.js';
import {
  createProductSchema,
  updateProductSchema,
  createVariantSchema,
  updateVariantSchema,
} from './products.validation.js';
import {
  handleListProducts,
  handleGetProduct,
  handleCreateProduct,
  handleUpdateProduct,
  handleDeleteProduct,
  handleAddVariant,
  handleEditVariant,
  handleDeleteVariant,
} from './products.controller.js';

const router = Router({ mergeParams: true });

// All routes require authentication + tenant resolution
router.use(authenticate, resolveTenant);

// Product CRUD — Staff and Admin can write, all can read
router.get('/', authorize('ADMIN', 'STAFF'), handleListProducts);
router.get('/:id', authorize('ADMIN', 'STAFF'), handleGetProduct);
router.post('/', authorize('ADMIN', 'STAFF'), validateRequest({ body: createProductSchema }), handleCreateProduct);
router.patch('/:id', authorize('ADMIN', 'STAFF'), validateRequest({ body: updateProductSchema }), handleUpdateProduct);
router.delete('/:id', authorize('ADMIN'), handleDeleteProduct);

// Variant management
router.post('/:productId/variants', authorize('ADMIN', 'STAFF'), validateRequest({ body: createVariantSchema }), handleAddVariant);
router.patch('/:productId/variants/:variantId', authorize('ADMIN', 'STAFF'), validateRequest({ body: updateVariantSchema }), handleEditVariant);
router.delete('/:productId/variants/:variantId', authorize('ADMIN'), handleDeleteVariant);

export default router;
