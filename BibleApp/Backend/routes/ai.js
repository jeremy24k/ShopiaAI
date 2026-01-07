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
    const { verse, verses, bookName, chapter, verseNumber, type, translationValue, bookId, isMultiple } = req.body;
    
    // Validar datos según el modo
    if (isMultiple) {
      if (!verses || !Array.isArray(verses) || verses.length === 0 || !bookName || !chapter) {
        return res.status(400).json({
          success: false,
          error: 'Faltan datos: verses (array), bookName, chapter son requeridos para múltiples versículos'
        });
      }
      console.log(`🌊 Streaming MÚLTIPLE: ${bookName} ${chapter}:${verses.map(v => v.verseNumber).join(',')} - Tipo: ${type || 'general'}`);
    } else {
      if (!verse || !bookName || !chapter || !verseNumber) {
        return res.status(400).json({
          success: false,
          error: 'Faltan datos: verse, bookName, chapter, verseNumber son requeridos'
        });
      }
      console.log(`🌊 Streaming SINGLE: ${bookName} ${chapter}:${verseNumber} - Tipo: ${type || 'general'}`);
    }
    
    // Configurar headers para streaming
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    
    // Usar el servicio de streaming con soporte para múltiples versículos
    await DeepSeekService.explainVerseStreaming(
      isMultiple ? verses : verse, 
      bookName, 
      chapter, 
      isMultiple ? null : verseNumber, 
      type, 
      translationValue, 
      bookId,
      isMultiple,
      (chunk) => {
        // Enviar cada chunk inmediatamente al cliente
        res.write(chunk);
      }
    );
    
    res.end();
    const logVerses = isMultiple ? verses.map(v => v.verseNumber).join(',') : verseNumber;
    console.log(`✅ Streaming completado para ${bookName} ${chapter}:${logVerses}`);
    
  } catch (error) {
    console.error('Error en streaming:', error);
    if (!res.headersSent) {
      res.status(500).json({ success: false, error: 'Error interno del servidor' });
    } else {
      res.end();
    }
  }
});

// POST /api/ai/ask-question-stream - Preguntas libres tipo chat con historial
router.post('/ask-question-stream', async (req, res) => {
  try {
    const { question, verseContext, conversationHistory } = req.body;
    
    if (!question || !question.trim()) {
      return res.status(400).json({
        success: false,
        error: 'La pregunta es requerida'
      });
    }

    const historyLength = conversationHistory?.length || 0;
    console.log(`💬 Pregunta: "${question.substring(0, 50)}..." (historial: ${historyLength} msgs) ${verseContext ? `(contexto: ${verseContext.bookName} ${verseContext.chapter})` : ''}`);
    
    // Configurar headers para streaming
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    
    await DeepSeekService.answerQuestion(
      question,
      verseContext,
      conversationHistory,
      (chunk) => {
        res.write(chunk);
      }
    );
    
    res.end();
    console.log(`✅ Respuesta completada para pregunta`);
    
  } catch (error) {
    console.error('Error en pregunta:', error);
    if (!res.headersSent) {
      res.status(500).json({ success: false, error: 'Error interno del servidor' });
    } else {
      res.end();
    }
  }
});

export default router;
