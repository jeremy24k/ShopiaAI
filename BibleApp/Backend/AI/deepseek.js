import { testConnection, getCompleteResponse, getStreamingResponse, generateVerseLink } from "./utils/aiHelpers.js";

// Clase para manejar todas las funciones de IA
class DeepSeekService {
        
    // NUEVO: Función para streaming real
    static async explainVerseStreaming(verse, bookName, chapter, verseNumber, type, translationValue, bookId, onChunk) {
        try {
            console.log(`🌊 Procesando streaming REAL tipo: ${type}`);
            
            // Importar generadores de prompts
            const promptGenerators = await import('./utils/promptGenerators.js');
            const { getBasePrompt, getLinkInstructions } = await import('./utils/basePrompt.js');
            
            // Generar el prompt según el tipo usando las funciones helper
            let fullPrompt = '';
            
            switch (type) {
                case 'aplicacionDiaria':
                    fullPrompt = promptGenerators.getDailyApplicationPrompt(verse, bookName, chapter, verseNumber, translationValue, bookId);
                    break;
                
                case 'contextoHistorico':
                    fullPrompt = promptGenerators.getHistoricalContextPrompt(verse, bookName, chapter, verseNumber, translationValue, bookId);
                    break;
                
                case 'explicacionSencilla':
                    fullPrompt = promptGenerators.getSimpleExplanationPrompt(verse, bookName, chapter, verseNumber, translationValue, bookId);
                    break;

                case 'vesiculosRelacionados':
                    fullPrompt = promptGenerators.getRelatedVersesPrompt(verse, bookName, chapter, verseNumber, translationValue, bookId);
                    break;

                case 'TraducirAlIdiomaOriginal':
                    fullPrompt = promptGenerators.getOriginalLanguagePrompt(verse, bookName, chapter, verseNumber, translationValue, bookId);
                    break;

                case 'ProponerGuiaDeEstudio':
                    fullPrompt = promptGenerators.getStudyPlanPrompt(verse, bookName, chapter, verseNumber, translationValue, bookId);
                    break;
                
                default:
                    // Fallback genérico
                    const basePrompt = getBasePrompt(bookName, chapter, verseNumber, bookId, translationValue);
                    const linkInstructions = getLinkInstructions(bookName, chapter, verseNumber, bookId, translationValue);
                    
                    
                    fullPrompt = `${basePrompt}
                        **Pasaje:** ${bookName} ${chapter}:${verseNumber}
                        **Texto:** "${verse}"

                        Proporciona una explicación completa con contexto, significado y aplicación práctica.

                        ${linkInstructions}
                    `;
        }
            // Usar streaming REAL desde DeepSeek
            await getStreamingResponse(fullPrompt, onChunk);
            
        } catch (error) {
            console.error('Error en explainVerseStreaming:', error);
            throw error;
        }
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
