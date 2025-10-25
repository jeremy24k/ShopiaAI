import { getCompleteResponse } from '../utils/aiHelpers.js';

// Función específica para aplicación diaria
export async function explainDailyApplication(verse, bookName, chapter, verseNumber, translationValue, bookId) {
    try {
        const prompt = `Como Consejero Bíblico Pastoral, proporciona una guía práctica para aplicar este pasaje en la vida diaria:

        **Pasaje:** ${bookName} ${chapter}:${verseNumber}
        **Texto:** "${verse}"

        ## ENFOQUE ESPECÍFICO: APLICACIÓN PRÁCTICA DIARIA

        ### 🎯 Objetivos del Análisis
        - Extraer principios prácticos aplicables hoy
        - Proporcionar ejemplos concretos de aplicación
        - Ofrecer pasos prácticos de implementación
        - Conectar con situaciones de la vida moderna

        # Aplicación Diaria de ${bookName} ${chapter}:${verseNumber}

        ## 📖 Texto Bíblico
        "${verse}" (${bookName} ${chapter}:${verseNumber})

        ## 💡 Principios Clave
        [Principios fundamentales extraídos del texto]

        ## 🏠 Aplicación en la Familia
        [Cómo aplicar estos principios en las relaciones familiares]

        ## 💼 Aplicación en el Trabajo
        [Implementación en el ámbito laboral y profesional]

        ## 🤝 Aplicación en Relaciones
        [Aplicación en amistades y relaciones interpersonales]

        ## 🙏 Aplicación Espiritual
        [Cómo este pasaje fortalece la vida espiritual personal]

        ## 📝 Pasos Prácticos
        1. [Paso específico y medible]
        2. [Paso específico y medible]
        3. [Paso específico y medible]

        ## 🎯 Desafíos Comunes
        [Obstáculos típicos en la aplicación y cómo superarlos]

        ## 💪 Versículos de Apoyo
        [Referencias bíblicas que refuerzan esta aplicación]

        ## 🔗 Recursos para Crecimiento
        - [Our Daily Bread](https://ourdailybread.org) - Devocionales diarios
        - [Bible Study Tools](https://www.biblestudytools.com) - Herramientas de estudio
        - [Crosswalk](https://www.crosswalk.com) - Artículos de crecimiento espiritual

        ## INSTRUCCIONES PARA REFERENCIAS BÍBLICAS:
        Para el versículo actual (${bookName} ${chapter}:${verseNumber}), usa este bookId: ${bookId ? bookId.toLowerCase() : 'psa'}
        
        Cuando menciones versículos de apoyo o referencias, usa este formato:
        [Libro Capítulo:Versículo](/books/${bookId ? bookId.toLowerCase() : 'psa'}/CHAPTER?translation=${translationValue ? translationValue.toLowerCase() : 'rvr1960'}#${bookId ? bookId.toLowerCase() : 'psa'}-CHAPTER-VERSE-${translationValue ? translationValue.toLowerCase() : 'rvr1960'})
        
        **Ejemplo para este contexto:**
        [${bookName} ${chapter}:${verseNumber}](/books/${bookId ? bookId.toLowerCase() : 'psa'}/${chapter}?translation=${translationValue ? translationValue.toLowerCase() : 'rvr1960'}#${bookId ? bookId.toLowerCase() : 'psa'}-${chapter}-${verseNumber}-${translationValue ? translationValue.toLowerCase() : 'rvr1960'})

        ---
        *Guía de aplicación generada por IA. Busca orientación pastoral y comunitaria para discernimiento personal.*`;

        const explanation = await getCompleteResponse(prompt);

        return {
            success: true,
            data: {
                explanation: explanation,
                verse: verse,
                reference: `${bookName} ${chapter}:${verseNumber}`,
                type: 'aplicacionDiaria'
            }
        };

    } catch (error) {
        console.error('Error al generar la respuesta', error);
        return {
            success: false,
            error: error.message || 'Error al generar la respuesta'
        };
    }
}
