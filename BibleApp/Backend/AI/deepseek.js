import { explainDailyApplication } from "./functions/explainDailyApplication.js";
import { explainHistoricalContext } from "./functions/explainHistoricalContext.js";
import { explainRelatedVerses } from "./functions/explainRelatedVerses.js";
import { SuggestStudyPlan } from "./functions/SuggestStudyPlan.js";
import { TranslateToOriginalLanguage } from "./functions/TranslateToOriginalLanguage.js";
import { SimpleExplanation } from "./functions/SimpleExplanation.js";
import { testConnection, getCompleteResponse, generateVerseLink } from "./utils/aiHelpers.js";

// Clase para manejar todas las funciones de IA
class DeepSeekService {
        
    // Función principal que delega a las funciones específicas
    static async explainVerse(verse, bookName, chapter, verseNumber, type, translationValue, bookId) {
        try {
            console.log(`🎯 Procesando explicación tipo: ${type}`);
            
            switch (type) {
                case 'contextoHistorico':
                    return await explainHistoricalContext(verse, bookName, chapter, verseNumber, translationValue, bookId);
                
                case 'aplicacionDiaria':
                    return await explainDailyApplication(verse, bookName, chapter, verseNumber, translationValue, bookId);
                
                case 'vesiculosRelacionados':
                    return await explainRelatedVerses(verse, bookName, chapter, verseNumber, translationValue, bookId);

                case 'ProponerGuiaDeEstudio':
                    return await SuggestStudyPlan(verse, bookName, chapter, verseNumber, translationValue, bookId);

                case 'TraducirAlIdiomaOriginal':
                    return await TranslateToOriginalLanguage(verse, bookName, chapter, verseNumber, translationValue, bookId);

                case 'explicacionSencilla':
                    return await SimpleExplanation(verse, bookName, chapter, verseNumber, translationValue, bookId);
                
                default:
                    // Fallback a explicación general si el tipo no es reconocido
                    const prompt = `Como Asistente Exegético Bíblico, proporciona un análisis completo del siguiente pasaje:
                    
                    **Pasaje:** ${bookName} ${chapter}:${verseNumber}
                    **Texto:** "${verse}"

                    Proporciona un análisis equilibrado que incluya contexto histórico, significado teológico y aplicación práctica.`;

                    const explanation = await getCompleteResponse(prompt);

                    return {
                        success: true,
                        data: {
                            explanation: explanation,
                            verse: verse,
                            reference: `${bookName} ${chapter}:${verseNumber}`,
                            type: 'general'
                        }
                    };
            }

        } catch (error) {
            console.error('Error en explainVerse:', error);
            return {
                success: false,
                error: error.message || 'Error al generar explicación'
            };
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