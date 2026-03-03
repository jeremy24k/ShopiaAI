import supabase from '../supabase/supabase.js';
import { AI_COSTS } from '../config/creditPackages.js';
import { extractButtonType } from '../AI/utils/actionDetection.js';

/**
 * Middleware que solo verifica saldo para chat-stream (la deducción se hace tras stream exitoso).
 * Adjunta en req los datos para deducir después: pendingCreditDeduction.
 */
export const checkCreditsForChatStream = async (req, res, next) => {
    try {
        const { userId, message, messageType = 'question' } = req.body;

        if (!userId) {
            req.skipCreditDeduction = true;
            return next();
        }

        let actionType = 'message';
        let creditCost = AI_COSTS.message || 1;

        if (messageType === 'button' && message) {
            const buttonType = extractButtonType(message);
            if (buttonType && AI_COSTS[buttonType]) {
                actionType = buttonType;
                creditCost = AI_COSTS[buttonType];
            }
        }

        const { data, error } = await supabase
            .from('user_credits')
            .select('credits, tier')
            .eq('user_id', userId)
            .single();

        if (error && error.code !== 'PGRST116') {
            console.error('❌ Error verificando créditos:', error);
            return res.status(500).json({
                success: false,
                error: 'Error processing credits'
            });
        }

        const currentCredits = data?.credits ?? 0;
        if (currentCredits < creditCost) {
            return res.status(402).json({
                success: false,
                error: 'insufficient_credits',
                message: 'Insufficient credits',
                current_credits: currentCredits,
                required: creditCost
            });
        }

        req.pendingCreditDeduction = {
            userId,
            creditCost,
            actionType,
            conversationId: req.body.conversationId || null
        };
        next();
    } catch (error) {
        console.error('❌ Error en checkCreditsForChatStream:', error);
        res.status(500).json({
            success: false,
            error: 'Error in credit middleware'
        });
    }
};

/**
 * Middleware para verificar y deducir créditos antes de usar la IA (deducción inmediata)
*/
export const checkAndDeductCredits = async (req, res, next) => {
    try {
        const { userId, message, messageType = 'question' } = req.body

        if (!userId) {
            console.log('⚠️ Usuario no autenticado - permitiendo acceso limitado');
            req.skipCreditDeduction = true;
            return next();
        }

        // Determinar el tipo de acción y su costo
        let actionType = 'message';
        let creditCost = AI_COSTS.message || 1;

        if (messageType === 'button' && message) {
            const buttonType = extractButtonType(message);
            if (buttonType && AI_COSTS[buttonType]) {
                actionType = buttonType;
                creditCost = AI_COSTS[buttonType];
                console.log(`🔘 Detectado cobro especializado para botón: ${buttonType} (Costo: ${creditCost})`);
            }
        }

        console.log(`💰 Verificando créditos para usuario ${userId} - Costo: ${creditCost}`);

        const { data, error } = await supabase.rpc('deduct_credits', {
            p_user_id: userId,
            p_amount: creditCost,
            p_action_type: actionType,
            p_conversation_id: req.body.conversationId || null,
            p_tokens_used: null,
            p_cost_usd: null
        });

        if (error) {
            console.error('❌ Error deduciendo créditos:', error);
            return res.status(500).json({
                success: false,
                error: 'Error processing credits'
            });
        }

        // Verificar si la deducción fue exitosa
        if (!data.success) {
            console.log('⛔ Créditos insuficientes');
            return res.status(402).json({
                success: false,
                error: 'insufficient_credits',
                message: data.message,
                current_credits: data.current_credits,
                required: data.required
            });
        }


        console.log(`✅ Créditos deducidos - Nuevo balance: ${data.new_balance}`);

        // Guardar info en request para uso posterior
        req.creditInfo = {
            deducted: data.credits_deducted,
            newBalance: data.new_balance
        };

        next();
    } catch (error) {
        console.error('❌ Error en middleware de créditos:', error);
        res.status(500).json({
            success: false,
            error: 'Error in credit middleware'
        });
    }
}


export const checkCreditsOnly = async (req, res, next) => {
    try {
        const { userId } = req.body;

        if (!userId) {
            req.userCredits = { credits: 0, tier: 'FREE' };
            return next();
        }

        const { data, error } = await supabase
            .from('user_credits')
            .select('credits, tier')
            .eq('user_id', userId)
            .single();

        if (error && error.code !== 'PGRST116') {
            throw error;
        }

        req.userCredits = {
            credits: data?.credits || 0,
            tier: data?.tier || 'FREE'
        };

        next();
    } catch (error) {
        console.error('❌ Error verificando créditos:', error);
        next(); // Continuar aunque falle
    }
};