import { Router } from 'express';
import { handleRegister, handleLogin, handleLogout, handleMe } from './auth.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { validateRequest } from '../../middleware/validateRequest.js';
import { authLimiter } from '../../middleware/rateLimiter.js';
import { registerSchema, loginSchema } from './auth.validation.js';

const router = Router();

router.post('/register', authLimiter, validateRequest({ body: registerSchema }), handleRegister);
router.post('/login', authLimiter, validateRequest({ body: loginSchema }), handleLogin);
router.post('/logout', handleLogout);
router.get('/me', authenticate, handleMe);

export default router;

