import { getCompleteResponse } from '../utils/aiHelpers.js';

// Función específica para aplicación diaria
export async function TranslateToOriginalLanguage(verse, bookName, chapter, verseNumber, translationValue, bookId) {
    try {
        const prompt = `
        Proporciona un análisis lingüístico del siguiente versículo, incluyendo información sobre las palabras originales basada en recursos académicos disponibles:

        **Pasaje:** ${bookName} ${chapter}:${verseNumber}
        **Texto:** "${verse}"

        ## INSTRUCCIONES ESPECÍFICAS

        ### 📚 Metodología de Análisis
        - Consulta y referencia recursos lexicográficos confiables
        - Presenta información sobre palabras originales CITANDO fuentes académicas
        - Enfócate en el significado contextual de términos clave
        - Compara cómo diferentes traducciones manejan los términos

        ### 🔍 Estructura Requerida

        # Análisis Lingüístico de ${bookName} ${chapter}:${verseNumber}

        ## 📖 Texto Original y Traducciones
        "${verse}" (${bookName} ${chapter}:${verseNumber})

        ## 🔠 Análisis de Palabras Clave

        ### Término 1: [PALABRA EN ESPAÑOL]
        - **Palabra original:** [griego/hebreo] - [transliteración]
        - **Significado léxico:** [basado en diccionarios académicos]
        - **Uso en contexto:** [explicación contextual]
        - **Fuente:** [nombre del recurso académico]

        ### Término 2: [PALABRA EN ESPAÑOL]  
        - **Palabra original:** [griego/hebreo] - [transliteración]
        - **Significado léxico:** [basado en diccionarios académicos]
        - **Uso en contexto:** [explicación contextual]
        - **Fuente:** [nombre del recurso académico]

        ## 📊 Comparación de Traducciones
        - **RVR1960:** [texto]
        - **NVI:** [texto] 
        - **LBLA:** [texto]
        - **Notas sobre diferencias:** [análisis]

        ## 🎯 Aplicación del Análisis Lingüístico
        [Qué aporta este análisis a la comprensión del texto]

        ## 🔗 Recursos Académicos Consultados

        ### 📖 Herramientas de Estudio de Lenguas Originales
        - [Blue Letter Bible](https://www.blueletterbible.org) - Diccionarios Strong y Vine
        - [Bible Hub](https://biblehub.com) - Textos interlineales y léxicos
        - [StudyLight](https://www.studylight.org) - Recursos de lenguas bíblicas
        - [WordStudy](https://www.wordstudy.org) - Análisis de palabras griegas/hebreas

        ### 🎓 Recursos Académicos
        - [Diccionario Expositivo Vine](https://www.escuelabiblica.com/recursos/vine)
        - [Diccionario Strong de Palabras Originales](https://www.bibliatodo.com/diccionario-biblico/strong)
        - [Comentarios Exegéticos](https://www.thegospelcoalition.org/commentary)

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
        *Este análisis se basa en recursos lexicográficos y académicos disponibles públicamente. Para estudio especializado de lenguas bíblicas, consulte a expertos en griego y hebreo.*`;

        const explanation = await getCompleteResponse(prompt);

        return {
            success: true,
            data: {
                explanation: explanation,
                verse: verse,
                reference: `${bookName} ${chapter}:${verseNumber}`,
                type: 'TraducirAlIdiomaOriginal'
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
