import { getBasePrompt, getLinkInstructions } from './basePrompt.js';

// Funciones helper para generar prompts específicos por tipo

export function getSimpleExplanationPrompt(verse, bookName, chapter, verseNumber, translationValue, bookId) {
    const basePrompt = getBasePrompt(bookName, chapter, verseNumber, bookId, translationValue);
    const linkInstructions = getLinkInstructions(bookName, chapter, verseNumber, bookId, translationValue);


    return `${basePrompt}
        ===PASAJE BÍBLICO===
        **Pasaje:** ${bookName} ${chapter}:${verseNumber}
        **Texto:** "${verse}"
        ===FIN PASAJE BÍBLICO===

        ===ESTRUCTURA OPTIMIZADA===
            **INSTRUCCIÓN CRÍTICA:** NUNCA incluyas las etiquetas ===SECCIÓN=== en tu respuesta final.

            [COMIENZA LA RESPUESTA FINAL]
                ===EXPLICACIÓN SENCILLA===
                    Explica como si hablaras con un amigo en un café
                    Usa lenguaje simple y ejemplos cotidianos
                    2-3 párrafos
                ===FIN EXPLICACIÓN SENCILLA===

                ===CONTEXTO BREVE===
                    1 párrafo sobre qué estaba pasando
                ===FIN CONTEXTO BREVE===

                ===APLICACIÓN PRÁCTICA===
                    2-3 aplicaciones concretas para implementar HOY
                ===FIN APLICACIÓN PRÁCTICA===

                ===PALABRA DE ALIENTO===
                    2-3 frases cálidas
                ===FIN PALABRA DE ALIENTO===

                ===PARA PROFUNDIZAR===
                    3 versículos + recursos 2-3
                ===FIN PARA PROFUNDIZAR===
            [TERMINA LA RESPUESTA FINAL]
        ===FIN ESTRUCTURA OPTIMIZADA===

        ${linkInstructions}
    `;
}

export function getDailyApplicationPrompt(verse, bookName, chapter, verseNumber, translationValue, bookId) {
    const basePrompt = getBasePrompt(bookName, chapter, verseNumber, bookId, translationValue);
    const linkInstructions = getLinkInstructions(bookName, chapter, verseNumber, bookId, translationValue);


    return `${basePrompt}

        ===PASAJE BÍBLICO===
        **Pasaje:** ${bookName} ${chapter}:${verseNumber}
        **Texto:** "${verse}"
        ===FIN PASAJE BÍBLICO===

        ===ENFOQUE ESPECIAL PARA APLICACIÓN DIARIA===
            **PRIORIDAD:** Enfócate en cómo este versículo se aplica PRÁCTICAMENTE en la vida cotidiana.
            - Proporciona ejemplos concretos y situaciones reales
            - Conecta con desafíos modernos (trabajo, familia, relaciones, decisiones)
            - Ofrece pasos accionables que alguien pueda implementar HOY
        ===FIN ENFOQUE ESPECIAL===

        ===ESTRUCTURA OPTIMIZADA===
            **INSTRUCCIÓN CRÍTICA:** NUNCA incluyas las etiquetas ===SECCIÓN=== en tu respuesta final.

            [COMIENZA LA RESPUESTA FINAL]
                ===EXPLICACIÓN SENCILLA===
                    Explica el versículo de manera conversacional, conecta emocionalmente, usa lenguaje cotidiano.
                    Duración: 2-3 párrafos concisos
                ===FIN EXPLICACIÓN SENCILLA===

                ===CONTEXTO BREVE===
                    Máximo 1 párrafo sobre qué estaba pasando y por qué se escribió
                ===FIN CONTEXTO BREVE===

                ===APLICACIÓN PRÁCTICA===
                    3-4 aplicaciones específicas divididas por áreas: familia, trabajo, relaciones, vida espiritual
                    Formato: Lista organizada por áreas
                ===FIN APLICACIÓN PRÁCTICA===

                ===PALABRA DE ALIENTO===
                    2-3 frases cálidas y esperanzadoras
                ===FIN PALABRA DE ALIENTO===

                ===PARA PROFUNDIZAR===
                    Máximo 3 versículos relacionados + 1-2 recursos
                ===FIN PARA PROFUNDIZAR===
            [TERMINA LA RESPUESTA FINAL]
        ===FIN ESTRUCTURA OPTIMIZADA===

        ${linkInstructions}
    `;
}

export function getHistoricalContextPrompt(verse, bookName, chapter, verseNumber, translationValue, bookId) {
    const basePrompt = getBasePrompt(bookName, chapter, verseNumber, bookId, translationValue);
    const linkInstructions = getLinkInstructions(bookName, chapter, verseNumber, bookId, translationValue);


    return `${basePrompt}

        ===PASAJE BÍBLICO===
        **Pasaje:** ${bookName} ${chapter}:${verseNumber}
        **Texto:** "${verse}"
        ===FIN PASAJE BÍBLICO===

        ===ENFOQUE ESPECIAL PARA CONTEXTO HISTÓRICO===
        **PRIORIDAD:** Explica el trasfondo histórico, cultural y social del versículo.
        Mantén un tono accesible y conecta siempre con la relevancia actual.
        ===FIN ENFOQUE ESPECIAL===

        ===ESTRUCTURA OPTIMIZADA===
        **INSTRUCCIÓN CRÍTICA:** NUNCA incluyas las etiquetas ===SECCIÓN=== en tu respuesta final.

        [COMIENZA LA RESPUESTA FINAL]
            ===EXPLICACIÓN SENCILLA===
                2-3 párrafos introduciendo el contexto histórico de manera accesible
            ===FIN EXPLICACIÓN SENCILLA===

            ===CONTEXTO HISTÓRICO DETALLADO===
                Época, lugar, circunstancias, costumbres, cultura, eventos históricos
                2-3 párrafos narrativos
            ===FIN CONTEXTO HISTÓRICO DETALLADO===

            ===APLICACIÓN PRÁCTICA===
                2-3 aplicaciones que conecten el contexto histórico con hoy
            ===FIN APLICACIÓN PRÁCTICA===

            ===PALABRA DE ALIENTO===
                2-3 frases conectando el mensaje histórico con la esperanza presente
            ===FIN PALABRA DE ALIENTO===

            ===PARA PROFUNDIZAR===
                3 versículos del mismo contexto + recursos sobre historia bíblica
            ===FIN PARA PROFUNDIZAR===
        [TERMINA LA RESPUESTA FINAL]
        ===FIN ESTRUCTURA OPTIMIZADA===

        ${linkInstructions}
    `;
}

export function getRelatedVersesPrompt(verse, bookName, chapter, verseNumber, translationValue, bookId) {
    const basePrompt = getBasePrompt(bookName, chapter, verseNumber, bookId, translationValue);
    const linkInstructions = getLinkInstructions(bookName, chapter, verseNumber, bookId, translationValue);


    return `${basePrompt}

    ===PASAJE BÍBLICO===
    **Pasaje:** ${bookName} ${chapter}:${verseNumber}
    **Texto:** "${verse}"
    ===FIN PASAJE BÍBLICO===

    ===ENFOQUE ESPECIAL PARA VERSÍCULOS RELACIONADOS===
        Identifica 4-6 versículos relacionados temáticamente
        Explica CÓMO y POR QUÉ cada uno se relaciona
    ===FIN ENFOQUE ESPECIAL===

    ===ESTRUCTURA OPTIMIZADA===
        **INSTRUCCIÓN CRÍTICA:** NUNCA incluyas las etiquetas ===SECCIÓN=== en tu respuesta final.

        [COMIENZA LA RESPUESTA FINAL]
            ===EXPLICACIÓN SENCILLA===
                2 párrafos sobre el tema central
            ===FIN EXPLICACIÓN SENCILLA===

            ===VERSÍCULOS RELACIONADOS===
                4-6 versículos con texto completo + explicación de la conexión
                Organiza por categorías
            ===FIN VERSÍCULOS RELACIONADOS===

            ===APLICACIÓN PRÁCTICA===
                2-3 aplicaciones integrando el mensaje de varios versículos
            ===FIN APLICACIÓN PRÁCTICA===

            ===PALABRA DE ALIENTO===
                2-3 frases animando a explorar las conexiones
            ===FIN PALABRA DE ALIENTO===

            ===PARA PROFUNDIZAR===
                Herramientas para encontrar versículos relacionados
            ===FIN PARA PROFUNDIZAR===
        [TERMINA LA RESPUESTA FINAL]
    ===FIN ESTRUCTURA OPTIMIZADA===

    ${linkInstructions}
    `;
}

export function getOriginalLanguagePrompt(verse, bookName, chapter, verseNumber, translationValue, bookId) {
    const basePrompt = getBasePrompt(bookName, chapter, verseNumber, bookId, translationValue);
    const linkInstructions = getLinkInstructions(bookName, chapter, verseNumber, bookId, translationValue);


    return `${basePrompt}

        ===PASAJE BÍBLICO===
        **Pasaje:** ${bookName} ${chapter}:${verseNumber}
        **Texto:** "${verse}"
        ===FIN PASAJE BÍBLICO===

        ===ENFOQUE ESPECIAL PARA IDIOMA ORIGINAL===
        Explora el texto en hebreo/arameo/griego
        Identifica palabras clave y sus matices
        Mantén tono accesible, no académico
        ===FIN ENFOQUE ESPECIAL===

        ===ESTRUCTURA OPTIMIZADA===
            **INSTRUCCIÓN CRÍTICA:** NUNCA incluyas las etiquetas ===SECCIÓN=== en tu respuesta final.

            [COMIENZA LA RESPUESTA FINAL]
                ===EXPLICACIÓN SENCILLA===
                    2 párrafos introduciendo el idioma original
                ===FIN EXPLICACIÓN SENCILLA===

                ===ANÁLISIS DEL IDIOMA ORIGINAL===
                    2-4 palabras clave con transliteración, significado literal, matices
                    Lenguaje accesible
                ===FIN ANÁLISIS DEL IDIOMA ORIGINAL===

                ===APLICACIÓN PRÁCTICA===
                    2-3 aplicaciones basadas en los matices del idioma original
                ===FIN APLICACIÓN PRÁCTICA===

                ===PALABRA DE ALIENTO===
                    2-3 frases apreciando la riqueza de la Palabra
                ===FIN PALABRA DE ALIENTO===

                ===PARA PROFUNDIZAR===
                    Versículos con las mismas palabras + recursos sobre idiomas bíblicos
                ===FIN PARA PROFUNDIZAR===
            [TERMINA LA RESPUESTA FINAL]
        ===FIN ESTRUCTURA OPTIMIZADA===

        ${linkInstructions}
    `;
}

export function getStudyPlanPrompt(verse, bookName, chapter, verseNumber, translationValue, bookId) {
    const basePrompt = getBasePrompt(bookName, chapter, verseNumber, bookId, translationValue);
    const linkInstructions = getLinkInstructions(bookName, chapter, verseNumber, bookId, translationValue);


    return `${basePrompt}

        ===PASAJE BÍBLICO===
        **Pasaje:** ${bookName} ${chapter}:${verseNumber}
        **Texto:** "${verse}"
        ===FIN PASAJE BÍBLICO===

        ===ENFOQUE ESPECIAL PARA GUÍA DE ESTUDIO===
            Crear plan de estudio de 5-7 días práctico y estructurado
            Preguntas de reflexión y actividades de aplicación
        ===FIN ENFOQUE ESPECIAL===

        ===ESTRUCTURA OPTIMIZADA===
            **INSTRUCCIÓN CRÍTICA:** NUNCA incluyas las etiquetas ===SECCIÓN=== en tu respuesta final.

            [COMIENZA LA RESPUESTA FINAL]
                ===EXPLICACIÓN SENCILLA===
                    2 párrafos sobre por qué vale la pena estudiar este versículo
                ===FIN EXPLICACIÓN SENCILLA===

                ===PLAN DE ESTUDIO SEMANAL===
                    5-7 días con enfoque, pasajes, preguntas y actividades
                ===FIN PLAN DE ESTUDIO SEMANAL===

                ===PREGUNTAS PARA REFLEXIÓN PROFUNDA===
                    5-7 preguntas profundas y personales
                ===FIN PREGUNTAS PARA REFLEXIÓN PROFUNDA===

                ===APLICACIÓN PRÁCTICA===
                    3-4 actividades prácticas específicas
                ===FIN APLICACIÓN PRÁCTICA===

                ===PALABRA DE ALIENTO===
                    2-3 frases animando al estudio bíblico regular
                ===FIN PALABRA DE ALIENTO===

                ===PARA PROFUNDIZAR===
                    Recursos de estudio bíblico y herramientas
                ===FIN PARA PROFUNDIZAR===
            [TERMINA LA RESPUESTA FINAL]
        ===FIN ESTRUCTURA OPTIMIZADA===

        ${linkInstructions}
    `;
}
