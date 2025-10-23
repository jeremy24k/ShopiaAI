import OpenAI from "openai";
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

// Configurar cliente de OpenAI para DeepSeek
const openai = new OpenAI({
    baseURL: 'https://api.deepseek.com',
    apiKey: process.env.DEEPSEEK_API_KEY,
});

// Clase para manejar todas las funciones de IA
class DeepSeekService {
    
    // Función para calcular tokens dinámicamente para continuaciones
    static calculateMaxTokensForContinuation(attempt, userMessage) {
        const baseTokens = 1500;
        
        // Reducir tokens en cada intento sucesivo
        const attemptFactor = Math.max(0.5, 1 - (attempt * 0.3));
        
        // Considerar longitud del mensaje original
        const lengthFactor = Math.min(userMessage.length / 300, 2);
        
        return Math.floor(baseTokens * attemptFactor * lengthFactor);
    }

    // Función para verificar si la respuesta está completa
    static isResponseComplete(content) {
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
    static async getCompleteResponse(userMessage, model = "deepseek-chat") {
        let fullResponse = '';
        let previousContext = '';
        let attempt = 0;
        const maxAttempts = 3;
        
        console.log(`🔄 Iniciando respuesta completa (máximo ${maxAttempts} intentos)`);
        
        while (attempt < maxAttempts) {
            try {
                // Calcular tokens para este intento
                const maxTokens = this.calculateMaxTokensForContinuation(attempt, userMessage);
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
                if (this.isResponseComplete(content) || attempt === maxAttempts - 1) {
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

    // Función para explicar un versículo bíblico (ahora con respuesta completa)
    static async explainVerse(verse, bookName, chapter, verseNumber) {
        try {
            const prompt = `Explica este versículo bíblico de manera clara y sencilla:"${verse}"
                Libro: ${bookName}, Capítulo ${chapter}, Versículo ${verseNumber}
                Por favor proporciona:
                1. Una explicación del significado
                2. El contexto histórico si es relevante
                3. Una aplicación práctica para la vida moderna
                Mantén la respuesta en español y de manera respetuosa.`;

            // Usar la nueva función de respuesta completa
            const explanation = await this.getCompleteResponse(prompt);

            return {
                success: true,
                data: {
                    explanation: explanation,
                    verse: verse,
                    reference: `${bookName} ${chapter}:${verseNumber}`
                }
            };

        } catch (error) {
            console.error('Error en DeepSeek:', error);
            return {
                success: false,
                error: error.message || 'Error al generar explicación'
            };
        }
    }

    // Función de prueba
    static async testConnection() {
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
}

export default DeepSeekService;