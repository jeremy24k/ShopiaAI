import express from 'express';
import DeepSeekService from '../ai/deepseek.js';
import { checkAndDeductCredits } from '../middleware/creditMiddleware.js';

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

// POST /api/ai/chat-stream - Endpoint unificado para chat con contexto de versículos, modos y doctrinas
router.post('/chat-stream', checkAndDeductCredits, async (req, res) => {
  try {
    const { 
      message, 
      messageType = 'question', 
      verseContext, 
      conversationHistory = [],
      modeId = 'personal_guide',      // NUEVO: modo por defecto
      doctrineId = 'evangelical', // NUEVO: doctrina por defecto
      language = 'es'           // NUEVO: idioma por defecto
    } = req.body;

    console.log('🤖 Chat Stream - Modo:', modeId, ', Doctrina:', doctrineId, ', Idioma:', language, ', Tipo:', messageType);  // DEBUG
    console.log('🔍 Tipos de datos:', { 
      modeId: typeof modeId, 
      doctrineId: typeof doctrineId, 
      language: typeof language,
      modeIdValue: modeId,
      doctrineIdValue: doctrineId,
      languageValue: language
    });  // DEBUG EXTRA

    console.log(`🤖 Chat Stream - Modo: ${modeId}, Doctrina: ${doctrineId}, Idioma: ${language}, Tipo: ${messageType}`);

    // Validar combinación de modo y doctrina
    const validation = DeepSeekService.validateModeDoctrineCombination(modeId, doctrineId);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        error: validation.error
      });
    }

    // Configurar headers para streaming
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    });

    // Procesar el mensaje con modo, doctrina e idioma
    await DeepSeekService.processChatMessage(
      message, 
      verseContext, 
      conversationHistory, 
      messageType === 'button',
      (chunk) => {
        res.write(chunk);
      },
      modeId,      // NUEVO: pasar modo
      doctrineId,   // NUEVO: pasar doctrina
      language      // NUEVO: pasar idioma
    );

    res.end();
  } catch (error) {
    console.error('❌ Error en chat-stream:', error);
    // Solo enviar respuesta si los headers no han sido enviados aún
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }
});

// GET /api/ai/modes - Obtener modos de IA disponibles (con traducciones)
router.get('/modes', (req, res) => {
  try {
    const language = req.query.language || 'es';  // NUEVO: idioma desde query params
    const modes = DeepSeekService.getAvailableModes(language);
    res.json({
      success: true,
      data: modes
    });
  } catch (error) {
    console.error('Error obteniendo modos:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// GET /api/ai/perspectives - Obtener perspectivas doctrinales disponibles (con traducciones)
router.get('/perspectives', (req, res) => {
  try {
    const language = req.query.language || 'es';  // NUEVO: idioma desde query params
    const perspectives = DeepSeekService.getAvailablePerspectives(language);
    res.json({
      success: true,
      data: perspectives
    });
  } catch (error) {
    console.error('Error obteniendo perspectivas:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// GET /api/ai/validate-combination - Validar combinación de modo y doctrina
router.get('/validate-combination/:modeId/:doctrineId', (req, res) => {
  try {
    const { modeId, doctrineId } = req.params;
    const validation = DeepSeekService.validateModeDoctrineCombination(modeId, doctrineId);
    res.json({
      success: true,
      data: validation
    });
  } catch (error) {
    console.error('Error validando combinación:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

export default router;
