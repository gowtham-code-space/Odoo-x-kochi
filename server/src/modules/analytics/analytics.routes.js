import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { validateRequest } from '../../middleware/validateRequest.js';
import { analyticsLimiter } from '../../middleware/rateLimiter.js';
import { querySchema } from './analytics.validation.js';
import { handleQuery, handleHistory } from './analytics.controller.js';

const router = Router();

router.use(authenticate);
router.post('/query', analyticsLimiter, validateRequest({ body: querySchema }), handleQuery);
router.get('/history', handleHistory);

export default router;

