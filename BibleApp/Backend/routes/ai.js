import express from 'express';
import DeepSeekService from '../ai/deepseek.js';
import { checkCreditsForChatStream } from '../middleware/creditMiddleware.js';
import { AI_COSTS } from '../config/creditPackages.js';
import supabase from '../supabase/supabase.js';

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
router.post('/chat-stream', checkCreditsForChatStream, async (req, res) => {
  try {
    const {
      message,
      messageType = 'question',
      verseContext,
      conversationHistory = [],
      modeId = 'personal_guide',
      doctrineId = 'evangelical',
      language = 'es'
    } = req.body;

    console.log('🤖 Chat Stream - Modo:', modeId, ', Doctrina:', doctrineId, ', Idioma:', language, ', Tipo:', messageType);

    const validation = DeepSeekService.validateModeDoctrineCombination(modeId, doctrineId);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        error: validation.error
      });
    }

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    });

    await DeepSeekService.processChatMessage(
      message,
      verseContext,
      conversationHistory,
      messageType === 'button',
      (chunk) => {
        res.write(chunk);
      },
      modeId,
      doctrineId,
      language
    );

    res.end();

    if (req.pendingCreditDeduction) {
      const { userId, creditCost, actionType, conversationId } = req.pendingCreditDeduction;
      const { data, error } = await supabase.rpc('deduct_credits', {
        p_user_id: userId,
        p_amount: creditCost,
        p_action_type: actionType,
        p_conversation_id: conversationId,
        p_tokens_used: null,
        p_cost_usd: null
      });
      if (error) {
        console.error('❌ Error deduciendo créditos tras stream:', error);
      } else {
        console.log('✅ Créditos deducidos tras stream exitoso:', data?.new_balance);
      }
    }
  } catch (error) {
    const isStreamInterrupted = error?.message === 'STREAM_INTERRUPTED';
    if (isStreamInterrupted) {
      console.warn('⚠️ Chat stream interrumpido (conexión cerrada o cancelada por el usuario)');
    } else {
      console.error('❌ Error en chat-stream:', error);
    }
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        error: isStreamInterrupted ? 'Conexión interrumpida' : 'Error interno del servidor'
      });
    } else {
      try {
        res.write('data: ' + JSON.stringify({
          error: isStreamInterrupted ? 'Conexión interrumpida' : 'Error interno del servidor'
        }) + '\n\n');
      } catch (_) {}
      res.end();
    }
  }
});

// GET /api/ai/modes - Obtener modos de IA disponibles (con traducciones)
router.get('/modes', (req, res) => {
  try {
    const language = req.query.lang || 'es';  // Corregido: lang en lugar de language
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
    const language = req.query.lang || 'es';  // Corregido: lang en lugar de language
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

// GET /api/ai/costs - Obtener costos de acciones de IA
router.get('/costs', (req, res) => {
  try {
    res.json({
      success: true,
      data: AI_COSTS
    });
  } catch (error) {
    console.error('Error obteniendo costos:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

export default router;
