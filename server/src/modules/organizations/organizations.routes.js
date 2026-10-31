import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { validateRequest } from '../../middleware/validateRequest.js';
import { addMemberSchema, createOrgSchema, organizationSettingSchema, updateMemberRoleSchema, updateOrgSchema } from './organizations.validation.js';
import {
  handleCreateOrg,
  handleListOrgs,
  handleGetOrg,
  handleSwitchOrg,
  handleUpdateOrg,
  handleListMembers,
  handleAddMember,
  handleUpdateMemberRole,
  handleRemoveMember,
  handleGetSettings,
  handleUpdateSettings,
} from './organizations.controller.js';

const router = Router();

router.use(authenticate);

router.post('/', validateRequest({ body: createOrgSchema }), handleCreateOrg);
router.get('/', handleListOrgs);
router.get('/:organizationId', handleGetOrg);
router.post('/:organizationId/switch', handleSwitchOrg);
router.patch('/:organizationId', validateRequest({ body: updateOrgSchema }), handleUpdateOrg);
router.get('/:organizationId/members', handleListMembers);
router.post('/:organizationId/members', validateRequest({ body: addMemberSchema }), handleAddMember);
router.patch('/:organizationId/members/:membershipId', validateRequest({ body: updateMemberRoleSchema }), handleUpdateMemberRole);
router.delete('/:organizationId/members/:membershipId', handleRemoveMember);
router.get('/:organizationId/settings', handleGetSettings);
router.patch('/:organizationId/settings', validateRequest({ body: organizationSettingSchema }), handleUpdateSettings);

export default router;

