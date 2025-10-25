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

// Función para obtener respuesta completa con continuaciones automáticas
export async function getCompleteResponse(userMessage, model = "deepseek-chat") {
    let fullResponse = '';
    let previousContext = '';
    let attempt = 0;
    const maxAttempts = 3;
    
    console.log(`🔄 Iniciando respuesta completa (máximo ${maxAttempts} intentos)`);
    
    while (attempt < maxAttempts) {
        try {
            // Calcular tokens para este intento
            const maxTokens = calculateMaxTokensForContinuation(attempt, userMessage);
            console.log(`📊 Intento ${attempt + 1}: ${maxTokens} tokens`);
            
            const messages = [
                { 
                    role: "system", 
                    content: "Eres un asistente especializado en explicar la Biblia de manera clara, respetuosa y educativa. Proporciona explicaciones accesibles para todos los niveles de conocimiento bíblico." 
                },
                { role: 'user', content: userMessage }
            ];
            
            // Si es una continuación, agregar contexto
            if (attempt > 0) {
                messages.splice(1, 0, { 
                    role: 'assistant', 
                    content: previousContext 
                });
                messages.push({ 
                    role: 'user', 
                    content: 'Continúa exactamente desde donde lo dejaste, sin repeticiones ni resúmenes.' 
                });
            }
            
            const response = await openai.chat.completions.create({
                messages: messages,
                model: model,
                max_tokens: maxTokens,
                temperature: 0.7
            });
            
            const content = response.choices[0].message.content;
            fullResponse += content;
            
            console.log(`✅ Intento ${attempt + 1} completado: ${content.length} caracteres`);
            
            // Verificar si la respuesta está completa
            if (isResponseComplete(content) || attempt === maxAttempts - 1) {
                console.log(`🎯 Respuesta completa después de ${attempt + 1} intentos`);
                break;
            }
            
            previousContext = fullResponse;
            attempt++;
            
            // Pequeña pausa entre intentos
            await new Promise(resolve => setTimeout(resolve, 500));
            
        } catch (error) {
            console.error(`❌ Error en intento ${attempt + 1}:`, error);
            break;
        }
    }
    
    return fullResponse;
}

// Función helper para generar links de versículos
export function generateVerseLink(bookId, chapterNum, verseNum, translationValue) {
    const bookIdLower = bookId ? bookId.toLowerCase() : 'genesis';
    const translationLower = translationValue ? translationValue.toLowerCase() : 'rvr1960';
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
