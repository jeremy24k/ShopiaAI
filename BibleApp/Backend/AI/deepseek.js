import { testConnection, getCompleteResponse, getStreamingResponse, generateVerseLink } from "./utils/aiHelpers.js";

// Clase para manejar todas las funciones de IA
class DeepSeekService {
        
    // NUEVO: Función para streaming real (soporta single y multiple)
    static async explainVerseStreaming(verseData, bookName, chapter, verseNumber, type, translationValue, bookId, isMultiple, onChunk) {
        try {
            console.log(`🌊 Procesando streaming REAL tipo: ${type} - Múltiple: ${isMultiple}`);
            
            // Importar generadores de prompts
            const promptGenerators = await import('./utils/promptGenerators.js');
            const { getBasePrompt, getLinkInstructions } = await import('./utils/basePrompt.js');
            
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
            
            // Generar el prompt según el tipo usando las funciones helper
            let fullPrompt = '';
            
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
                    // Fallback genérico
                    const basePrompt = getBasePrompt(bookName, chapter, verseDisplay, bookId, translationValue);
                    const linkInstructions = getLinkInstructions(bookName, chapter, verseDisplay, bookId, translationValue);
                    
                    const multipleNote = isMultiple ? '\n\n**Nota:** Estás analizando múltiples versículos. Proporciona una explicación integrada que considere todos los versículos como un pasaje unificado.' : '';
                    
                    fullPrompt = `${basePrompt}
                        **Pasaje:** ${bookName} ${chapter}:${verseDisplay}
                        **Texto:** "${verse}"
                        ${multipleNote}

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

    // Función para preguntas libres tipo chat con historial de conversación
    static async answerQuestion(question, verseContext, conversationHistory, onChunk) {
        try {
            console.log(`💬 Procesando pregunta libre (historial: ${conversationHistory?.length || 0} msgs)`);
            
            const { getLinkInstructions } = await import('./utils/basePrompt.js');
            
            let contextInfo = '';
            let linkInstructions = '';
            let historyContext = '';
            
            // Construir contexto del historial de conversación
            if (conversationHistory && conversationHistory.length > 0) {
                const formattedHistory = conversationHistory.map(msg => 
                    `${msg.role === 'user' ? '**Usuario:**' : '**Asistente:**'} ${msg.content}`
                ).join('\n\n');
                
                historyContext = `
                    ===HISTORIAL DE CONVERSACIÓN===
                        A continuación se muestra el historial de la conversación. Usa este contexto para dar respuestas coherentes y relevantes.
                        
                        ${formattedHistory}
                    ===FIN HISTORIAL===`;
                            }
                            
                            if (verseContext && verseContext.verses && verseContext.verses.length > 0) {
                                const versesText = verseContext.verses.map(v => `${v.verseNumber}. ${v.verse}`).join('\n');
                                const verseNumbers = verseContext.verses.map(v => v.verseNumber).join('-');
                                
                                contextInfo = `
                    ===CONTEXTO DEL VERSÍCULO SELECCIONADO===
                        **Libro:** ${verseContext.bookName}
                        **Capítulo:** ${verseContext.chapter}
                        **Versículos:**
                        ${versesText}
                        
                        Si la pregunta está relacionada con este contexto, úsalo para enriquecer tu respuesta.
                    ===FIN CONTEXTO===`;
                                
                                linkInstructions = getLinkInstructions(
                                    verseContext.bookName, 
                                    verseContext.chapter, 
                                    verseNumbers, 
                                    verseContext.bookId, 
                                    verseContext.translationValue
                                );
                            } else {
                                linkInstructions = `
                    ===GENERACION DE LINKS===
                        INSTRUCCIONES PARA REFERENCIAS BÍBLICAS:
                        Cuando menciones versículos, usa este formato:
                        [Libro Capítulo:Versículo](/books/BOOKID/CHAPTER?translation=spa_r09#BOOKID-CHAPTER-VERSE-spa_r09)
                        
                        Ejemplos de bookId comunes:
                        - Génesis: gen, Éxodo: exo, Salmos: psa, Proverbios: pro
                        - Mateo: mat, Marcos: mrk, Lucas: luk, Juan: jhn
                        - Romanos: rom, 1 Corintios: 1co, Efesios: eph, Filipenses: php
                        - Santiago: jas, 1 Pedro: 1pe, Apocalipsis: rev
                    ===FIN GENERACION DE LINKS===`;
                            }

                            const prompt = `
                    ===ROOT PROMPT===
                        Idioma de la respuesta: español
                        Formato de respuesta: Markdown

                        Comentaristas a consultar para respaldar tu respuesta:
                        F.F. Bruce, John MacArthur, J.I. Packer, Juan Calvino, William Hendriksen,
                        James Montgomery Boice, Timothy Keller, Gordon Fee, David Jeremiah.
                        
                        Debes basar tu respuestas siguiendo la doctrina cristiana, específicamente la evangélica pentecostal.
                        Responde solo preguntas relacionadas con la Biblia. Si la pregunta no está relacionada, responde: "Lo siento, solo puedo ayudarte con preguntas relacionadas con la Biblia y la fe cristiana."
                        Evita hablar como si fueras un experto absoluto; deja claro que eres una herramienta para potenciar el estudio bíblico.
                        Siempre cita versículos o comentaristas bíblicos reconocidos para respaldar lo que dices.
                    ===FIN ROOT PROMPT===

                    ===INSTRUCCIONES===
                        Actúa como un asistente de estudio bíblico con IA. Tu objetivo es responder de manera SENCILLA, PRÁCTICA y CÁLIDA.
                        Tu tono debe ser como el de un pastor o mentor espiritual que acompaña, no como un académico distante.
                        Prioriza la claridad sobre el tecnicismo.
                        
                        IMPORTANTE: Tienes acceso al historial de la conversación. Usa este contexto para:
                        - Dar respuestas coherentes con lo que ya se ha discutido
                        - Evitar repetir información ya proporcionada
                        - Hacer referencias a puntos anteriores cuando sea relevante
                        - Mantener continuidad en la conversación
                    ===FIN INSTRUCCIONES===

                    ${historyContext}

                    ${contextInfo}

                    PREGUNTA DEL USUARIO: "${question}"

                    FORMATO DE TU RESPUESTA (usa Markdown con estos encabezados exactos):

                    ## Respuesta
                    (Responde la pregunta de forma clara y directa en 2-3 párrafos usando lenguaje accesible. Si es una pregunta de seguimiento, conecta con lo anterior.)

                    ## Fundamento Bíblico
                    (Cita 2-3 versículos que respalden tu respuesta. Explica brevemente cómo se relacionan.)

                    ## Aplicación Práctica
                    (1-2 formas concretas de aplicar esto en la vida diaria.)

                    ## Para Profundizar
                    (2-3 versículos adicionales para estudiar y 1-2 recursos o temas relacionados.)

                ${linkInstructions} 
            `;

            await getStreamingResponse(prompt, onChunk);
            
        } catch (error) {
            console.error('Error en answerQuestion:', error);
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
