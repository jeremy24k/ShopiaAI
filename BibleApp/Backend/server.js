// Cargar variables de entorno PRIMERO (antes de cualquier import)
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import bibleRoutes from './routes/bible.js';
import aiRoutes from './routes/ai.js';
import paymentsRoutes from './routes/payments.js';
import feedbackRoutes from './routes/feedback.js';
import authRoutes from './routes/auth.js';

const app = express();
const PORT = process.env.PORT || 5000;
const isProduction = process.env.NODE_ENV === 'production';

// Confiar en el proxy de Railway/Vercel/Render (necesario para Express Rate Limit)
app.set('trust proxy', 1);

// ========================================
// SECURITY MIDDLEWARES
// ========================================

// Helmet - Security headers
app.use(helmet());

// CORS - Whitelist de dominios permitidos
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : [
      'http://localhost:5173',
      'http://localhost:4173',
      'https://sophiabible.com',
      'https://www.sophiabible.com'
    ];

app.use(cors({
  origin: (origin, callback) => {
    // Permitir requests sin origin (mobile apps, Postman, etc)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

// Rate Limiting - General (Suavizado para evitar falsos positivos)
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 300, // Aumentado de 100 a 300
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'too_many_requests' }
});

// Rate Limiting - AI endpoints (Más generoso para la experiencia de chat)
const aiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 30, // Aumentado de 10 a 30
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'too_many_ai_requests' }
});

app.use('/api', generalLimiter);
app.use('/api/ai', aiLimiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint (used by Railway/Render for uptime monitoring)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Usar rutas
app.use('/api', bibleRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/auth', authRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({
    message: 'Bible API Backend funcionando correctamente',
    version: '1.0.0',
    endpoints: {
      translations: 'GET /api/translations',
      books: 'GET /api/books/:translation',
      chapter: 'GET /api/chapter/:translation/:book/:chapter',
      commentaries: 'GET /api/commentaries',
      commentaryBooks: 'GET /api/commentary-books/:commentary',
      commentaryChapter: 'GET /api/commentary/:commentary/:book/:chapter',
      commentaryProfiles: 'GET /api/commentary-profiles/:commentary',
      commentaryProfile: 'GET /api/commentary-profile/:commentary/:profile',
      aiTest: 'GET /api/ai/test',
      aiChat: 'POST /api/ai/chat-stream'
    }
  });
});

// Middleware para rutas no encontradas
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Ruta no encontrada'
  });
});

// Middleware para manejo de errores globales
app.use((error, req, res, next) => {
  console.error('Error:', error);
  // Solo enviar respuesta si los headers no han sido enviados aún
  if (!res.headersSent) {
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Bible API Backend v1.0.0 running on port ${PORT}`);
  console.log(`🔒 Environment: ${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'}`);
  console.log(`🌐 CORS origins: ${allowedOrigins.join(', ')}`);
});
