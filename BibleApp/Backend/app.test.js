import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import bibleRoutes from './routes/bible.js';
import aiRoutes from './routes/ai.js';
import feedbackRoutes from './routes/feedback.js';
import authRoutes from './routes/auth.js';

export function createTestApp() {
  const app = express();

  app.set('trust proxy', 1);

  app.use(helmet());

  const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : [
        'http://localhost:5173',
        'http://localhost:4173'
      ];

  app.use(cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true
  }));

  const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, error: 'too_many_requests' }
  });

  const aiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, error: 'too_many_ai_requests' }
  });

  app.use('/api', generalLimiter);
  app.use('/api/ai', aiLimiter);

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.use('/api', bibleRoutes);
  app.use('/api/ai', aiRoutes);
  app.use('/api/feedback', feedbackRoutes);
  app.use('/api/auth', authRoutes);

  app.get('/', (req, res) => {
    res.json({
      message: 'Bible API Backend test',
      version: '1.0.0'
    });
  });

  app.use((req, res) => {
    res.status(404).json({
      success: false,
      error: 'Ruta no encontrada'
    });
  });

  app.use((error, req, res, next) => {
    console.error('Error:', error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  });

  return app;
}
