import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { env } from '../../config/env.js';

const router = Router();

router.use(authenticate);

/**
 * GET /api/v1/ai/status
 * Returns whether AI features are configured and available.
 */
router.get('/status', (_req, res) => {
  res.json({
    success: true,
    data: {
      enabled: env.AI_ENABLED,
      model: env.AI_ENABLED ? env.LLM_MODEL : null,
      message: env.AI_ENABLED
        ? `AI enabled using model: ${env.LLM_MODEL}`
        : 'AI is not configured. Set LLM_API_KEY in your .env file to enable AI features.',
    },
  });
});

export default router;

