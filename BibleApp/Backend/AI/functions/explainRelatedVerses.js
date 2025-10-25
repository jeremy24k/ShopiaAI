import { getCompleteResponse } from '../utils/aiHelpers.js';

// Función específica para versículos relacionados
export async function explainRelatedVerses(verse, bookName, chapter, verseNumber, translationValue, bookId) {
    try {
        const prompt = `Como Especialista en Referencias Cruzadas Bíblicas, identifica y explica versículos relacionados temáticamente:

        **Pasaje:** ${bookName} ${chapter}:${verseNumber}
        **Texto:** "${verse}"

        ## ENFOQUE ESPECÍFICO: VERSÍCULOS RELACIONADOS

        ### 🎯 Objetivos del Análisis
        - Identificar pasajes con temas similares
        - Mostrar progresión temática a través de la Escritura
        - Proporcionar contexto bíblico amplio
        - Facilitar estudio temático profundo

        # Versículos Relacionados con ${bookName} ${chapter}:${verseNumber}

        ## 📖 Texto Base
        "${verse}" (${bookName} ${chapter}:${verseNumber})

        ## 🔗 Tema Principal
        [Identificación del tema central del pasaje]

        ## 📚 Antiguo Testamento
        ### Pasajes Relacionados:
        - **[Referencia]** - "[Texto del versículo]"
          *Conexión:* [Explicación de cómo se relaciona]

        - **[Referencia]** - "[Texto del versículo]"
          *Conexión:* [Explicación de cómo se relaciona]

        ## ✝️ Nuevo Testamento
        ### Pasajes Relacionados:
        - **[Referencia]** - "[Texto del versículo]"
          *Conexión:* [Explicación de cómo se relaciona]

        - **[Referencia]** - "[Texto del versículo]"
          *Conexión:* [Explicación de cómo se relaciona]

        ## INSTRUCCIONES IMPORTANTES PARA REFERENCIAS:
        
        **FORMATO DE LINKS OBLIGATORIO:**
        Para el versículo actual (${bookName} ${chapter}:${verseNumber}), usa este bookId: ${bookId ? bookId.toLowerCase() : 'psa'}
        
        Cuando menciones cualquier referencia bíblica, usa este formato:
        [Libro Capítulo:Versículo](/books/${bookId ? bookId.toLowerCase() : 'psa'}/CHAPTER?translation=${translationValue ? translationValue.toLowerCase() : 'rvr1960'}#${bookId ? bookId.toLowerCase() : 'psa'}-CHAPTER-VERSE-${translationValue ? translationValue.toLowerCase() : 'rvr1960'})

        **Ejemplo para este contexto:**
        [${bookName} ${chapter}:${verseNumber}](/books/${bookId ? bookId.toLowerCase() : 'psa'}/${chapter}?translation=${translationValue ? translationValue.toLowerCase() : 'rvr1960'}#${bookId ? bookId.toLowerCase() : 'psa'}-${chapter}-${verseNumber}-${translationValue ? translationValue.toLowerCase() : 'rvr1960'})

        **IMPORTANTE:** Usa SIEMPRE el bookId correcto que corresponde a cada libro bíblico.

        ## 🌟 Progresión Temática
        [Cómo este tema se desarrolla a través de toda la Biblia]

        ## 🔍 Palabras Clave Relacionadas
        [Términos bíblicos clave que conectan estos pasajes]

        ## 📖 Estudio Temático Sugerido
        [Secuencia recomendada para estudiar este tema en profundidad]

        ## 🎯 Síntesis Teológica
        [Cómo estos versículos juntos revelan verdades bíblicas]

        ## 🔗 Herramientas de Referencias Cruzadas
        - [OpenBible.info](https://www.openbible.info/topics/) - Búsqueda temática
        - [Bible.org](https://bible.org) - Estudios temáticos detallados
        - [StudyLight](https://www.studylight.org) - Concordancias y referencias

        ---
        *Referencias cruzadas generadas por IA. Verifica las citas bíblicas y consulta concordancias académicas.*`;

        const explanation = await getCompleteResponse(prompt);

        return {
            success: true,
            data: {
                explanation: explanation,
                verse: verse,
                reference: `${bookName} ${chapter}:${verseNumber}`,
                type: 'vesiculosRelacionados'
            }
        };

    } catch (error) {
        console.error('Error en versículos relacionados:', error);
        return {
            success: false,
            error: error.message || 'Error al generar versículos relacionados'
        };
    }
}
