import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import crypto from 'crypto';

import { env } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import { NotFoundError } from './errors/HttpErrors.js';
import apiRouter from './routes/index.js';

const app = express();

// Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
}));

// CORS — credentials required for httpOnly cookies
app.use(cors({
  origin: env.CLIENT_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Request ID for tracing
app.use((req, _res, next) => {
  req.id = crypto.randomUUID();
  next();
});

// Logging
app.use(morgan(env.isDev ? 'dev' : 'combined'));

// Body parsing
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Cookie parsing
app.use(cookieParser());

// Rate limiting
app.use('/api', apiLimiter);

// API routes
app.use('/api/v1', apiRouter);

// 404 for unmatched API routes
app.use('/api/*', (_req, _res, next) => {
  next(new NotFoundError('API endpoint not found'));
});

// Centralized error handler
app.use(errorHandler);

export default app;

