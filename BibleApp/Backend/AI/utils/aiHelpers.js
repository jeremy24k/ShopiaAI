import OpenAI from "openai";
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

// Configurar cliente de OpenAI para DeepSeek
const openai = new OpenAI({
    baseURL: 'https://api.deepseek.com',
    apiKey: process.env.DEEPSEEK_API_KEY,
});

// Función para calcular tokens dinámicamente para continuaciones
export function calculateMaxTokensForContinuation(attempt, userMessage) {
    const baseTokens = 1500;
    
    // Reducir tokens en cada intento sucesivo
    const attemptFactor = Math.max(0.5, 1 - (attempt * 0.3));
    
    // Considerar longitud del mensaje original
    const lengthFactor = Math.min(userMessage.length / 300, 2);
    
    return Math.floor(baseTokens * attemptFactor * lengthFactor);
}

// Función para verificar si la respuesta está completa
export function isResponseComplete(content) {
    // Verificar si termina con puntos suspensivos, se corta en medio de una oración, etc.
    const incompleteIndicators = [
        /\.\.\.$/, // Termina con ...
        /[,;:]$/, // Termina con coma, punto y coma, o dos puntos
        /\w+$/, // Termina abruptamente sin puntuación
        /\*\*[^*]*$/, // Formato markdown incompleto
        /^\d+\./, // Lista numerada incompleta al final
    ];
    
    const trimmedContent = content.trim();
    const lastLine = trimmedContent.split('\n').pop().trim();
    
    // Si termina con punto, signo de exclamación o interrogación, probablemente está completo
    if (/[.!?]$/.test(lastLine)) {
        return true;
    }
    
    // Verificar indicadores de incompletitud
    return !incompleteIndicators.some(pattern => pattern.test(lastLine));
}

// Función NUEVA para streaming real desde DeepSeek
export async function getStreamingResponse(userMessage, onChunk, model = "deepseek-chat") {
    try {
        console.log(`🌊 Iniciando streaming real desde DeepSeek...`);
        
        const messages = [
            { 
                role: "system", 
                content: "Eres un asistente especializado en explicar la Biblia de manera clara, respetuosa y educativa. Proporciona explicaciones concisas y bien estructuradas." 
            },
            { role: 'user', content: userMessage }
        ];
        
        const stream = await openai.chat.completions.create({
            messages: messages,
            model: model,
            max_tokens: 6000, // Optimizado para respuestas completas de todas las acciones premium sin cortes
            temperature: 0.7,
            stream: true // ¡Activar streaming real!
        });
        
        let fullResponse = '';
        
        for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
                fullResponse += content;
                // Llamar al callback con cada chunk
                if (onChunk) {
                    onChunk(content);
                }
            }
        }
        
        console.log(`✅ Streaming completado: ${fullResponse.length} caracteres`);
        return fullResponse;
        
    } catch (error) {
        const isConnectionError =
            error?.message === 'terminated' ||
            error?.code === 'ECONNRESET' ||
            error?.cause?.code === 'ECONNRESET' ||
            error?.name === 'AbortError';
        if (isConnectionError) {
            console.warn('⚠️ Stream interrumpido (conexión cerrada o cancelada)');
            throw new Error('STREAM_INTERRUPTED');
        }
        console.error(`❌ Error en streaming:`, error);
        throw error;
    }
}

// Función helper para generar links de versículos
export function generateVerseLink(bookId, chapterNum, verseNum, translationValue) {
    const bookIdLower = bookId ? bookId.toLowerCase() : 'genesis';
    const translationLower = translationValue ? translationValue.toLowerCase() : 'spa_r09';
    return `/books/${bookIdLower}/${chapterNum}?translation=${translationLower}#${bookIdLower}-${chapterNum}-${verseNum}-${translationLower}`;
}

// Función de prueba de conexión
export async function testConnection() {
    try {
        const completion = await openai.chat.completions.create({
            messages: [
                { role: "user", content: "Di 'Conexión exitosa con DeepSeek' en español" }
            ],
            model: "deepseek-chat",
            max_tokens: 20
        });

        return {
            success: true,
            data: { message: completion.choices[0].message.content }
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}
