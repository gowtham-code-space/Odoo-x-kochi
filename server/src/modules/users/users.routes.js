import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { validateRequest } from '../../middleware/validateRequest.js';
import { handleGetProfile, handleUpdateProfile, updateProfileSchema } from './users.controller.js';

const router = Router();

router.use(authenticate);
router.get('/me', handleGetProfile);
router.patch('/me', validateRequest({ body: updateProfileSchema }), handleUpdateProfile);

export default router;

