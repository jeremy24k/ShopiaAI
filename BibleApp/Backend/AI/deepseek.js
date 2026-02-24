import { testConnection, getCompleteResponse, getStreamingResponse, generateVerseLink } from "../AI/utils/aiHelpers.js";
import { createPromptBuilder, generatePromptForVerse, generatePromptForConversation } from "../AI/utils/promptBuilder.js";
import { getModeConfig, getDoctrinalPerspective, validateModeDoctrineCombination, getAllModes, getAllPerspectives } from "../AI/utils/aiModes.js";

// Clase para manejar todas las funciones de IA
class DeepSeekService {
    // NUEVO: Función para streaming con modos y doctrinas (soporta single y multiple)
    static async explainVerseStreaming(verseData, bookName, chapter, verseNumber, type, translationValue, bookId, isMultiple, onChunk, modeId = 'personal_guide', doctrineId = 'evangelical') {
        try {
            console.log(`🌊 Procesando streaming con modo: ${modeId}, doctrina: ${doctrineId}, tipo: ${type} - Múltiple: ${isMultiple}`);

            // Validar combinación de modo y doctrina
            const validation = validateModeDoctrineCombination(modeId, doctrineId);
            if (!validation.valid) {
                throw new Error(`Combinación inválida: modo ${modeId} con doctrina ${doctrineId}`);
            }

            // Preparar el texto del versículo según el modo
            let verse, verseDisplay;
            if (isMultiple && Array.isArray(verseData)) {
                // Múltiples versículos: combinar contenido
                verse = verseData.map(v => `${v.verseNumber}. ${v.verse}`).join('\n');
                verseDisplay = verseData.map(v => v.verseNumber).join(', ');
                verseNumber = verseDisplay; // Para mostrar en logs
            } else {
                verse = verseData;
                verseDisplay = verseNumber;
            }

            // Generar el prompt usando el nuevo sistema de modos y doctrinas
            let fullPrompt = '';

            // Para tipos específicos, usar el sistema de prompts tradicional temporalmente
            // TODO: Migrar todos los tipos al nuevo sistema
            if (type && type !== 'general') {
                const promptGenerators = await import('./utils/promptGenerators.js');
                
                switch (type) {
                    case 'aplicacionDiaria':
                        fullPrompt = promptGenerators.getDailyApplicationPrompt(verse, bookName, chapter, verseDisplay, translationValue, bookId, isMultiple);
                        break;

                    case 'contextoHistorico':
                        fullPrompt = promptGenerators.getHistoricalContextPrompt(verse, bookName, chapter, verseDisplay, translationValue, bookId, isMultiple);
                        break;

                    case 'explicacionSencilla':
                        fullPrompt = promptGenerators.getSimpleExplanationPrompt(verse, bookName, chapter, verseDisplay, translationValue, bookId, isMultiple);
                        break;

                    case 'vesiculosRelacionados':
                        fullPrompt = promptGenerators.getRelatedVersesPrompt(verse, bookName, chapter, verseDisplay, translationValue, bookId, isMultiple);
                        break;

                    case 'TraducirAlIdiomaOriginal':
                        fullPrompt = promptGenerators.getOriginalLanguagePrompt(verse, bookName, chapter, verseDisplay, translationValue, bookId, isMultiple);
                        break;

                    case 'ProponerGuiaDeEstudio':
                        fullPrompt = promptGenerators.getStudyPlanPrompt(verse, bookName, chapter, verseDisplay, translationValue, bookId, isMultiple);
                        break;

                    default:
                        // Usar nuevo sistema de modos y doctrinas para tipo general o fallback
                        fullPrompt = generatePromptForVerse(modeId, doctrineId, verse, bookName, chapter, verseDisplay, translationValue, bookId, isMultiple);
                }
            } else {
                // Usar nuevo sistema de modos y doctrinas
                fullPrompt = generatePromptForVerse(modeId, doctrineId, verse, bookName, chapter, verseDisplay, translationValue, bookId, isMultiple);
            }

            // Log del prompt generado para debugging
            console.log(`📝 Prompt generado con modo ${modeId} y doctrina ${doctrineId}`);
            
            // Usar streaming REAL desde DeepSeek
            await getStreamingResponse(fullPrompt, onChunk);

        } catch (error) {
            console.error('Error en explainVerseStreaming:', error);
            throw error;
        }
    }

    // NUEVO: Función unificada para procesar mensajes de chat con modos, doctrinas e idioma
    static async processChatMessage(message, verseContext, conversationHistory, isButtonMessage, onChunk, modeId = 'personal_guide', doctrineId = 'evangelical', language = 'es') {
        try {
            console.log(`🤖 Procesando mensaje - Modo: ${modeId}, Doctrina: ${doctrineId}, Idioma: ${language}, Botón: ${isButtonMessage}`);

            // Crear el prompt builder con modo, doctrina e idioma
            const promptBuilder = createPromptBuilder(modeId, doctrineId, language);
            
            // Generar el prompt para conversación
            const prompt = promptBuilder.buildConversationPrompt(message, verseContext, conversationHistory, isButtonMessage);
            
            // Enviar a DeepSeek y hacer streaming
            await getStreamingResponse(prompt, onChunk);
            
        } catch (error) {
            console.error('❌ Error en processChatMessage:', error);
            throw error;
        }
    }

    // Helper para extraer tipo de botón del mensaje
    static extractButtonType(message) {
        const typeMap = {
            'contextoHistorico': 'HistoricalContext',
            'aplicacionDiaria': 'DailyApplication',
            'explicacionSencilla': 'SimpleExplanation',
            'vesiculosRelacionados': 'RelatedVerses',
            'TraducirAlIdiomaOriginal': 'OriginalLanguage',
            'ProponerGuiaDeEstudio': 'StudyPlan'
        };

        for (const [key, value] of Object.entries(typeMap)) {
            if (message.includes(key)) {
                return value;
            }
        }
        return null;
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
