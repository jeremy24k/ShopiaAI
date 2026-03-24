import { testConnection, getStreamingResponse, generateVerseLink } from "../AI/utils/aiHelpers.js";
import { createPromptBuilder } from "../AI/utils/promptBuilder.js";
import { getModeConfig, getDoctrinalPerspective, validateModeDoctrineCombination, getAllModes, getAllPerspectives } from "../AI/utils/aiModes.js";
import { extractButtonType } from "../AI/utils/actionDetection.js";

// Clase para manejar todas las funciones de IA
class DeepSeekService {
    // NUEVO: Función unificada para procesar mensajes de chat con modos, doctrinas e idioma
    static async processChatMessage(message, verseContext, conversationHistory, isButtonMessage, onChunk, modeId = 'personal_guide', doctrineId = 'evangelical', language = 'es', globalTranslation = null) {
        try {
            console.log(`🤖 Procesando mensaje - Modo: ${modeId}, Doctrina: ${doctrineId}, Idioma: ${language}, Botón: ${isButtonMessage}, Traducción Global: ${globalTranslation}`);

            // Crear el prompt builder con modo, doctrina e idioma
            const promptBuilder = createPromptBuilder(modeId, doctrineId, language);

            // Si es un mensaje de botón, extraer el tipo para instrucciones específicas
            let buttonType = null;
            if (isButtonMessage) {
                buttonType = extractButtonType(message);
                console.log(`🔘 Botón detectado: ${buttonType}`);
            }

            // Generar el prompt para conversación pasando el tipo de botón y traducción global
            const prompt = promptBuilder.buildConversationPrompt(message, verseContext, conversationHistory, isButtonMessage, buttonType, globalTranslation);

            // Enviar a DeepSeek y hacer streaming
            await getStreamingResponse(prompt, onChunk);

        } catch (error) {
            console.error('❌ Error en processChatMessage:', error);
            throw error;
        }
    }

    // Helper para extraer tipo de botón del mensaje
    static extractButtonType(message) {
        return extractButtonType(message);
    }

    // NUEVO: Obtener información sobre modos disponibles (con traducciones)
    static getAvailableModes(language = 'es') {
        return getAllModes(language);
    }

    // NUEVO: Obtener información sobre perspectivas doctrinales disponibles (con traducciones)
    static getAvailablePerspectives(language = 'es') {
        return getAllPerspectives(language);
    }

    // NUEVO: Validar combinación de modo y doctrina
    static validateModeDoctrineCombination(modeId, doctrineId) {
        return validateModeDoctrineCombination(modeId, doctrineId);
    }

    // NUEVO: Obtener configuración específica
    static getModeConfig(modeId) {
        return getModeConfig(modeId);
    }

    static getDoctrinalPerspective(doctrineId) {
        return getDoctrinalPerspective(doctrineId);
    }

    // Función de prueba
    static async testConnection() {
        return await testConnection();
    }

    // Función helper para generar links de versículos
    static generateVerseLink(bookId, chapterNum, verseNum, translationValue) {
        return generateVerseLink(bookId, chapterNum, verseNum, translationValue);
    }
}

export default DeepSeekService;
