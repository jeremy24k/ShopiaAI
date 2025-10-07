const express = require('express');
const router = express.Router();
const bibleAPI = require('../services/bibleAPI');

// Middleware para manejo de errores
const handleResponse = (res, result) => {
  if (result.success) {
    res.json({
      success: true,
      data: result.data
    });
  } else {
    res.status(500).json({
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
router.get('/books/:translation', async (req, res) => {
  try {
    const { translation } = req.params;
    
    if (!translation) {
      return res.status(400).json({
        success: false,
        error: 'El parámetro translation es requerido'
      });
    }

    const result = await bibleAPI.getBooks(translation);
    handleResponse(res, result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// GET /api/chapter/:translation/:book/:chapter - Obtener versículos de un capítulo
router.get('/chapter/:translation/:book/:chapter', async (req, res) => {
  try {
    const { translation, book, chapter } = req.params;
    
    if (!translation || !book || !chapter) {
      return res.status(400).json({
        success: false,
        error: 'Los parámetros translation, book y chapter son requeridos'
      });
    }

    const result = await bibleAPI.getChapter(translation, book, chapter);
    handleResponse(res, result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

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
router.get('/commentary-books/:commentary', async (req, res) => {
  try {
    const { commentary } = req.params;
    
    if (!commentary) {
      return res.status(400).json({
        success: false,
        error: 'El parámetro commentary es requerido'
      });
    }

    const result = await bibleAPI.getCommentaryBooks(commentary);
    handleResponse(res, result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// GET /api/commentary/:commentary/:book/:chapter - Obtener comentario de un capítulo
router.get('/commentary/:commentary/:book/:chapter', async (req, res) => {
  try {
    const { commentary, book, chapter } = req.params;
    
    if (!commentary || !book || !chapter) {
      return res.status(400).json({
        success: false,
        error: 'Los parámetros commentary, book y chapter son requeridos'
      });
    }

    const result = await bibleAPI.getCommentaryChapter(commentary, book, chapter);
    handleResponse(res, result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// GET /api/commentary-profiles/:commentary - Obtener perfiles de un comentario
router.get('/commentary-profiles/:commentary', async (req, res) => {
  try {
    const { commentary } = req.params;
    
    if (!commentary) {
      return res.status(400).json({
        success: false,
        error: 'El parámetro commentary es requerido'
      });
    }

    const result = await bibleAPI.getCommentaryProfiles(commentary);
    handleResponse(res, result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// GET /api/commentary-profile/:commentary/:profile - Obtener un perfil específico
router.get('/commentary-profile/:commentary/:profile', async (req, res) => {
  try {
    const { commentary, profile } = req.params;
    
    if (!commentary || !profile) {
      return res.status(400).json({
        success: false,
        error: 'Los parámetros commentary y profile son requeridos'
      });
    }

    const result = await bibleAPI.getCommentaryProfile(commentary, profile);
    handleResponse(res, result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

module.exports = router;
