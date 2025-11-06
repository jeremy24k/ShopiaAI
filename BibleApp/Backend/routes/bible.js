// routes/bibleRoutes.js
import express from 'express';
import bibleAPI from '../services/bibleAPI.js';
import { 
  BooksParamsSchema, 
  ChapterParamsSchema, 
  CommentaryBooksParamsSchema,
  CommentaryChapterParamsSchema,
  CommentaryProfileParamsSchema
} from '../schemas/bibleSchema.js';
import { validateParams } from '../middleware/validationMiddleware.js';

const router = express.Router();

// Middleware para manejo de errores (mejorado)
const handleResponse = (res, result) => {
  if (result.success) {
    res.json({
      success: true,
      data: result.data
    });
  } else {
    // Puedes analizar el error y dar respuestas más específicas
    const statusCode = result.error.includes('timeout') ? 504 : 500;
    res.status(statusCode).json({
      success: false,
      error: result.error
    });
  }
};

// GET /api/translations - Obtener todas las traducciones disponibles
router.get('/translations', async (req, res) => {
  try {
    const result = await bibleAPI.getAvailableTranslations();
    handleResponse(res, result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// GET /api/books/:translation - Obtener libros de una traducción
router.get('/books/:translation', 
  validateParams(BooksParamsSchema),
  async (req, res) => {
    try {
      const { translation } = req.validatedParams;
      const result = await bibleAPI.getBooks(translation);
      handleResponse(res, result);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }
);

// GET /api/chapter/:translation/:book/:chapter - Obtener versículos de un capítulo
router.get('/chapter/:translation/:book/:chapter',
  validateParams(ChapterParamsSchema),
  async (req, res) => {
    try {
      const { translation, book, chapter } = req.validatedParams;
      const result = await bibleAPI.getChapter(translation, book, chapter);
      handleResponse(res, result);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }
);

// GET /api/commentaries - Obtener comentarios disponibles
router.get('/commentaries', async (req, res) => {
  try {
    const result = await bibleAPI.getAvailableCommentaries();
    handleResponse(res, result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// GET /api/commentary-books/:commentary - Obtener libros de un comentario
router.get('/commentary-books/:commentary',
  validateParams(CommentaryBooksParamsSchema),
  async (req, res) => {
    try {
      const { commentary } = req.validatedParams;
      const result = await bibleAPI.getCommentaryBooks(commentary);
      handleResponse(res, result);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }
);

// GET /api/commentary/:commentary/:book/:chapter - Obtener comentario de un capítulo
router.get('/commentary/:commentary/:book/:chapter',
  validateParams(CommentaryChapterParamsSchema),
  async (req, res) => {
    try {
      const { commentary, book, chapter } = req.validatedParams;
      const result = await bibleAPI.getCommentaryChapter(commentary, book, chapter);
      handleResponse(res, result);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }
);

// GET /api/commentary-profiles/:commentary - Obtener perfiles de un comentario
router.get('/commentary-profiles/:commentary',
  validateParams(CommentaryBooksParamsSchema), // Reutilizamos el mismo schema
  async (req, res) => {
    try {
      const { commentary } = req.validatedParams;
      const result = await bibleAPI.getCommentaryProfiles(commentary);
      handleResponse(res, result);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }
);

// GET /api/commentary-profile/:commentary/:profile - Obtener un perfil específico
router.get('/commentary-profile/:commentary/:profile',
  validateParams(CommentaryProfileParamsSchema),
  async (req, res) => {
    try {
      const { commentary, profile } = req.validatedParams;
      const result = await bibleAPI.getCommentaryProfile(commentary, profile);
      handleResponse(res, result);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }
);

export default router;