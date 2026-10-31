import { Router } from 'express';
import { handleRegister, handleLogin, handleLogout, handleMe, handleForgotPassword, handleResetPassword, handleChangePassword } from './auth.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { validateRequest } from '../../middleware/validateRequest.js';
import { authLimiter } from '../../middleware/rateLimiter.js';
import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema, changePasswordSchema } from './auth.validation.js';

const router = Router();

router.post('/register', authLimiter, validateRequest({ body: registerSchema }), handleRegister);
router.post('/login', authLimiter, validateRequest({ body: loginSchema }), handleLogin);
router.post('/logout', handleLogout);
router.get('/me', authenticate, handleMe);
router.post('/forgot-password', authLimiter, validateRequest({ body: forgotPasswordSchema }), handleForgotPassword);
router.post('/reset-password', authLimiter, validateRequest({ body: resetPasswordSchema }), handleResetPassword);
router.post('/change-password', authenticate, validateRequest({ body: changePasswordSchema }), handleChangePassword);

export default router;

