import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { handleGetDashboard } from './dashboard.controller.js';

const router = Router();

router.use(authenticate);
router.get('/', handleGetDashboard);

export default router;

