import { getCompleteResponse } from '../utils/aiHelpers.js';

// Función específica para contexto histórico
export async function explainHistoricalContext(verse, bookName, chapter, verseNumber, translationValue, bookId) {
    try {
        const prompt = `Como Historiador Bíblico especializado, proporciona un análisis detallado del contexto histórico del siguiente pasaje:

        **Pasaje:** ${bookName} ${chapter}:${verseNumber}
        **Texto:** "${verse}"

        ## ENFOQUE ESPECÍFICO: CONTEXTO HISTÓRICO

        ### 🎯 Objetivos del Análisis
        - Situar el pasaje en su época histórica específica
        - Explicar las circunstancias culturales, políticas y sociales
        - Identificar eventos históricos relevantes
        - Analizar el trasfondo del autor y destinatarios

        # Contexto Histórico de ${bookName} ${chapter}:${verseNumber}

        ## 📖 Texto Bíblico
        "${verse}" (${bookName} ${chapter}:${verseNumber})

        ## 🏛️ Época y Período Histórico
        [Ubicación temporal específica del pasaje]

        ## 👑 Contexto Político
        [Situación política de la época: imperios, reyes, gobierno local]

        ## 🏺 Contexto Cultural y Social
        [Costumbres, tradiciones, estructura social de la época]

        ## 📜 Contexto del Autor
        [Información sobre quien escribió y las circunstancias de escritura]

        ## 👥 Audiencia Original
        [A quién se dirigía originalmente este mensaje]

        ## 🗺️ Contexto Geográfico
        [Ubicación geográfica y su importancia histórica]

        ## 📚 Referencias Históricas
        [Fuentes históricas extrabíblicas que confirman o contextualizan]

        ## 🔗 Recursos Históricos Recomendados
        - [Bible History Online](https://www.bible-history.com) - Cronologías y mapas
        - [Biblical Archaeology Society](https://www.biblicalarchaeology.org) - Descubrimientos arqueológicos
        - [Ancient History Encyclopedia](https://www.worldhistory.org) - Contexto del mundo antiguo

        ## INSTRUCCIONES PARA REFERENCIAS BÍBLICAS:
        Para el versículo actual (${bookName} ${chapter}:${verseNumber}), usa este bookId: ${bookId ? bookId.toLowerCase() : 'psa'}
        
        Cuando menciones cualquier referencia bíblica, usa este formato:
        [Libro Capítulo:Versículo](/books/${bookId ? bookId.toLowerCase() : 'psa'}/CHAPTER?translation=${translationValue ? translationValue.toLowerCase() : 'rvr1960'}#${bookId ? bookId.toLowerCase() : 'psa'}-CHAPTER-VERSE-${translationValue ? translationValue.toLowerCase() : 'rvr1960'})
        
        **Ejemplo para este contexto:**
        [${bookName} ${chapter}:${verseNumber}](/books/${bookId ? bookId.toLowerCase() : 'psa'}/${chapter}?translation=${translationValue ? translationValue.toLowerCase() : 'rvr1960'}#${bookId ? bookId.toLowerCase() : 'psa'}-${chapter}-${verseNumber}-${translationValue ? translationValue.toLowerCase() : 'rvr1960'})

        ---
        *Análisis histórico generado por IA. Verifica con fuentes académicas especializadas en historia bíblica.*`;

        const explanation = await getCompleteResponse(prompt);

        return {
            success: true,
            data: {
                explanation: explanation,
                verse: verse,
                reference: `${bookName} ${chapter}:${verseNumber}`,
                type: 'contextoHistorico'
            }
        };

    } catch (error) {
        console.error('Error en contexto histórico:', error);
        return {
            success: false,
            error: error.message || 'Error al generar contexto histórico'
        };
    }
}

