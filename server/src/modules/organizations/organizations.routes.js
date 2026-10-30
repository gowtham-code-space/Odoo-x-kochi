import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { validateRequest } from '../../middleware/validateRequest.js';
import { createOrgSchema } from './organizations.validation.js';
import {
  handleCreateOrg,
  handleListOrgs,
  handleGetOrg,
  handleSwitchOrg,
} from './organizations.controller.js';

const router = Router();

router.use(authenticate);

router.post('/', validateRequest({ body: createOrgSchema }), handleCreateOrg);
router.get('/', handleListOrgs);
router.get('/:organizationId', handleGetOrg);
router.post('/:organizationId/switch', handleSwitchOrg);

export default router;

