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

// POST /api/ai/explain-verse - Explicar un versículo
router.post('/explain-verse', async (req, res) => {
  try {
    const { verse, bookName, chapter, verseNumber } = req.body;
    
    // Validar que tenemos los datos necesarios
    if (!verse || !bookName || !chapter || !verseNumber) {
      return res.status(400).json({
        success: false,
        error: 'Faltan datos: verse, bookName, chapter, verseNumber son requeridos'
      });
    }

    console.log(`📝 Explicando versículo: ${bookName} ${chapter}:${verseNumber}`);
    const result = await DeepSeekService.explainVerse(verse, bookName, chapter, verseNumber);
    handleResponse(res, result);
    
  } catch (error) {
    console.error('Error explicando versículo:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// POST /api/ai/explain-verse-stream - Explicar versículo con streaming real
router.post('/explain-verse-stream', async (req, res) => {
  try {
    const { verse, bookName, chapter, verseNumber } = req.body;
    
    // Validar datos
    if (!verse || !bookName || !chapter || !verseNumber) {
      return res.status(400).json({
        success: false,
        error: 'Faltan datos: verse, bookName, chapter, verseNumber son requeridos'
      });
    }

    console.log(`🌊 Streaming explicación: ${bookName} ${chapter}:${verseNumber}`);
    
    // Configurar headers para streaming
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    // Obtener explicación completa
    const result = await DeepSeekService.explainVerse(verse, bookName, chapter, verseNumber);
    
    if (!result.success) {
      res.status(500).end(`Error: ${result.error}`);
      return;
    }
    
    // Enviar texto palabra por palabra
    const explanation = result.data.explanation;
    const words = explanation.split(' ');
    
    for (let i = 0; i < words.length; i++) {
      // Delay para simular streaming natural
      await new Promise(resolve => setTimeout(resolve, 50));
      res.write(words[i] + ' ');
    }
    
    res.end();
    
  } catch (error) {
    console.error('Error en streaming:', error);
    res.status(500).end('Error interno del servidor');
  }
});

export default router;
