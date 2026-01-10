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

// POST /api/ai/chat-stream - Endpoint unificado para chat con contexto de versículos
router.post('/chat-stream', async (req, res) => {
  try {
    const { message, verseContext, conversationHistory, messageType } = req.body;
    
    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        error: 'El mensaje es requerido'
      });
    }

    // Determinar el tipo de mensaje: 'button' o 'question'
    const isButtonMessage = messageType === 'button';
    const historyLength = conversationHistory?.length || 0;
    
    console.log(`🤖 Mensaje ${isButtonMessage ? 'de BOTÓN' : 'de USUARIO'}: "${message.substring(0, 50)}..." (historial: ${historyLength} msgs) ${verseContext ? `(contexto: ${verseContext.bookName} ${verseContext.chapter})` : ''}`);
    
    // Configurar headers para streaming
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    
    await DeepSeekService.processChatMessage(
      message,
      verseContext,
      conversationHistory,
      isButtonMessage,
      (chunk) => {
        res.write(chunk);
      }
    );
    
    res.end();
    console.log(`✅ Streaming completado para mensaje ${isButtonMessage ? 'de BOTÓN' : 'de USUARIO'}`);
    
  } catch (error) {
    console.error('Error en chat streaming:', error);
    if (!res.headersSent) {
      res.status(500).json({ success: false, error: 'Error interno del servidor' });
    } else {
      res.end();
    }
  }
});

export default router;
