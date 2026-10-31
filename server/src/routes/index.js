import { Router } from 'express';
import authRoutes from '../modules/auth/auth.routes.js';
import userRoutes from '../modules/users/users.routes.js';
import orgRoutes from '../modules/organizations/organizations.routes.js';
import dashboardRoutes from '../modules/dashboard/dashboard.routes.js';
import analyticsRoutes from '../modules/analytics/analytics.routes.js';
import aiRoutes from '../modules/ai/ai.routes.js';
import productRoutes from '../modules/products/products.routes.js';

const router = Router();

// Health check — no auth
router.get('/health', (_req, res) => {
  res.json({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
    },
  });
});

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/organizations', orgRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/ai', aiRoutes);
// Catalogue routes are nested under the organization so tenant resolution can
// verify membership before product data is read or changed.
router.use('/organizations/:organizationId/products', productRoutes);

export default router;

