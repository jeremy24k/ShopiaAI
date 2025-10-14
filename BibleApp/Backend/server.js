import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bibleRoutes from './routes/bible.js';

// Cargar variables de entorno PRIMERO
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Usar rutas
app.use('/api', bibleRoutes);

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
      commentaryProfile: 'GET /api/commentary-profile/:commentary/:profile'
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
  res.status(500).json({
    success: false,
    error: 'Error interno del servidor'
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📖 Bible API Backend v1.0.0`);
  console.log(`🌐 Endpoints disponibles:`);
  console.log(`   GET /api/translations - Obtener traducciones`);
  console.log(`   GET /api/books/:translation - Obtener libros`);
  console.log(`   GET /api/chapter/:translation/:book/:chapter - Obtener versículos`);
  console.log(`   GET /api/commentaries - Obtener comentarios`);
});
