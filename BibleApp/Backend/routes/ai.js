import express from 'express';
import DeepSeekService from '../ai/deepseek.js';

const router = express.Router();

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

// GET /api/ai/test - Probar conexión con DeepSeek
router.get('/test', async (req, res) => {
  try {
    console.log('🚀 Probando conexión con DeepSeek...');
    const result = await DeepSeekService.testConnection();
    handleResponse(res, result);
  } catch (error) {
    console.error('Error en test:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// POST /api/ai/explain-verse-stream - Explicar versículo con streaming REAL
router.post('/explain-verse-stream', async (req, res) => {
  try {
    const { verse, bookName, chapter, verseNumber, type, translationValue, bookId } = req.body;
    
    // Validar datos
    if (!verse || !bookName || !chapter || !verseNumber) {
      return res.status(400).json({
        success: false,
        error: 'Faltan datos: verse, bookName, chapter, verseNumber son requeridos'
      });
    }

    console.log(`🌊 Streaming REAL: ${bookName} ${chapter}:${verseNumber} - Tipo: ${type || 'general'}`);
    
    // Configurar headers para streaming
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    
    // Usar el nuevo servicio de streaming
    await DeepSeekService.explainVerseStreaming(
      verse, 
      bookName, 
      chapter, 
      verseNumber, 
      type, 
      translationValue, 
      bookId,
      (chunk) => {
        // Enviar cada chunk inmediatamente al cliente
        res.write(chunk);
      }
    );
    
    res.end();
    console.log(`✅ Streaming completado para ${bookName} ${chapter}:${verseNumber}`);
    
  } catch (error) {
    console.error('Error en streaming:', error);
    if (!res.headersSent) {
      res.status(500).json({ success: false, error: 'Error interno del servidor' });
    } else {
      res.end();
    }
  }
});

export default router;
