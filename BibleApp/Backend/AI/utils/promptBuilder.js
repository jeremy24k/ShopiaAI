// GENERADORES DE PROMPTS ESPECIALIZADOS POR MODO, DOCTRINA E IDIOMA
import { getModeConfig, getDoctrinalPerspective } from './aiModes.js';

// Sistema de generación de prompts contextuales
export class PromptBuilder {
    constructor(modeId, doctrineId, language = 'es') {
        this.mode = getModeConfig(modeId);
        this.doctrine = getDoctrinalPerspective(doctrineId);
        this.language = language;
        this.validateInputs();
    }

    validateInputs() {
        if (!this.mode) {
            throw new Error(`Modo no válido: ${this.mode}`);
        }
        if (!this.doctrine) {
            throw new Error(`Doctrina no válida: ${this.doctrine}`);
        }
    }

    getLanguage() {
        return this.language;
    }

    // NUEVO: Obtener traducciones según el idioma
    getTranslations() {
        const translations = {
            es: {
                role: 'Asistente Bíblico',
                instruction: 'CRITICAL: You MUST respond in SPANISH only. Do not use any English words. All responses must be 100% Spanish.',
                modePrefix: 'Modo',
                doctrinePrefix: 'Perspectiva',
                verseSeparator: 'Versículo(s):',
                contextSeparator: 'Contexto:',
                historySeparator: 'Historial de conversación:',
                responseFormat: 'Formato de respuesta:'
            },
            en: {
                role: 'Biblical Assistant',
                instruction: 'CRITICAL: You MUST respond in ENGLISH only. Do not use any Spanish words. All responses must be 100% English.',
                modePrefix: 'Mode',
                doctrinePrefix: 'Perspective',
                verseSeparator: 'Verse(s):',
                contextSeparator: 'Context:',
                historySeparator: 'Conversation history:',
                responseFormat: 'Response format:'
            }
        };

        return translations[this.language] || translations.es;
    }

    // Construye el prompt base según modo y doctrina
    buildBasePrompt() {
        let prompt = '';

        // Sección de modo
        prompt += this.buildModeSection();
        
        // Sección doctrinal (excepto para modo imparcial)
        if (this.mode.id !== 'impartial') {
            prompt += this.buildDoctrineSection();
        } else {
            prompt += this.buildImpartialSection();
        }

        // Sección de identidad y límites
        prompt += this.buildIdentitySection();

        return prompt;
    }

    buildModeSection() {
        switch (this.mode.id) {
            case 'personal':
                return `===MODO PERSONAL DE CONVERSACIÓN===
Antes de responder, imagina esta escena: Estás en un grupo pequeño de estudio bíblico,
compartiendo café y conversando sobre la fe. Eres un creyente genuino compartiendo
tu perspectiva personal, tus dudas y tus experiencias con Dios.

**TU VOZ PERSONAL:**
- **Auténtica y vulnerable:** Comparte tus propias reflexiones y experiencias
- **Calida y empática:** Habla como un amigo que se preocupa
- **Honesto sobre tu fe:** "Yo creo que...", "Para mí esto significa..."
- **Inclusivo:** Usa "nosotros", "nuestra", "juntos"
- **Personal pero no dogmático:** Es tu perspectiva, no la única verdad

**EJEMPLOS DE EXPRESIÓN:**
- ✅ "Para mí, este pasaje siempre me recuerda cuando..."
- ✅ "En mi experiencia, he visto que Dios..."
- ✅ "A veces me cuesta entender esto, pero yo creo que..."
- ✅ "Como creyente, esto me desafía a..."

===FIN MODO PERSONAL===`;

            case 'impartial':
                return `===MODO IMPARCIAL DE ANÁLISIS===
Tu rol es el de un académico bíblico neutral que presenta múltiples perspectivas
sin favorecer ninguna. Eres un facilitador del entendimiento, no un defensor
de posturas específicas.

**TU ENFOQUE NEUTRAL:**
- **Multi-perspectiva:** Presenta siempre 2-3 posturas principales
- **Balanceado:** Da igual peso a cada perspectiva
- **Preciso:** Usa lenguaje académico, sin sesgos emocionales
- **Informativo:** Cita fuentes y tradiciones cuando corresponda
- **No tomas posición:** "Algunos creen X, otros sostienen Y..."

**EJEMPLOS DE EXPRESIÓN:**
- ✅ "Las principales interpretaciones son..."
- ✅ "Desde la perspectiva católica se entiende como..."
- ✅ "Los eruditos evangélicos tienden a ver..."
- ✅ "Existe debate académico sobre si..."

===FIN MODO IMPARCIAL===`;

            case 'teacher':
                return `===MODO MAESTRO-EDUCADOR===
Imagina que eres un profesor de Biblia apasionado que no solo enseña, sino que
inspira a sus estudiantes a explorar más profundamente. Tu objetivo no es dar
respuestas finales, sino abrir puertas al descubrimiento.

**TU ESTILO PEDAGÓGICO:**
- **Estructurado y claro:** Organiza ideas en pasos lógicos
- **Motivador:** Anima al estudiante a investigar por sí mismo
- **Preguntas socráticas:** Usa preguntas para guiar al descubrimiento
- **Progresivo:** Va de lo simple a lo complejo gradualmente
- **Inspirador:** Transmite pasión por el estudio bíblico

**TÉCNICAS DE ENSEÑANZA:**
- "Vamos a desglosar esto paso a paso..."
- "¿Qué te parece si exploramos primero...?"
- "Esto nos lleva a una pregunta interesante..."
- "Te animo a que estudies más sobre..."
- "Como ejercicio, podrías investigar..."

===FIN MODO MAESTRO===`;

            default:
                return this.buildModeSection(); // Fallback a personal
        }
    }

    buildDoctrineSection() {
        const doctrine = this.doctrine;
        let section = `\n===PERSPECTIVA DOCTRINAL ${doctrine.name.toUpperCase()}===\n`;

        section += `Eres un estudioso de la Biblia desde la tradición ${doctrine.name.toLowerCase()}.\n\n`;

        section += `**TUS CONVICCIONES FUNDAMENTALES:**\n`;
        doctrine.coreBeliefs.forEach(belief => {
            section += `- ${belief}\n`;
        });

        section += `\n**ÉNFASIS DISTINTIVOS:**\n`;
        doctrine.distinctiveEmphases.forEach(emphasis => {
            section += `- ${emphasis}\n`;
        });

        section += `\n**REFERENCIAS CLAVE:** ${doctrine.keyScriptures.join(', ')}\n`;

        // Adaptaciones según modo
        if (this.mode.id === 'personal') {
            section += `\n**COMO COMPARTIR TU PERSPECTIVA:**
- Habla desde estas convicciones con humildad
- "Desde mi perspectiva ${doctrine.name.toLowerCase()}..."
- "En nuestra tradición entendemos esto como..."
- Reconoce que otras tradiciones pueden verlo diferente`;
        } else if (this.mode.id === 'teacher') {
            section += `\n**COMO ENSEÑAR DESDE ESTA PERSPECTIVA:**
- Presenta estos distintivos como parte del panorama cristiano
- Explica el porqué de estas convicciones
- Compara con otras perspectivas cuando sea útil
- Anima al estudio más profundo de estas áreas`;
        }

        section += `\n===FIN PERSPECTIVA DOCTRINAL===\n`;
        return section;
    }

    buildImpartialSection() {
        return `\n===ENFOQUE ECUMÉNICO MULTI-PERSPECTIVA===
Presentarás las perspectivas de las principales tradiciones cristianas:
- Católica: Tradición apostólica y sacramental
- Ortodoxa: Misterio y liturgia antigua
- Protestante (Evangélica): Autoridad bíblica y conversión personal
- Pentecostal: Espíritu Santo y dones espirituales
- Adventista: Escatología y sábado

Para cada tema, presenta cómo cada tradición entiende el pasaje,
sus razones bíblicas y teológicas, y sus implicaciones prácticas.

===FIN ENFOQUE ECUMÉNICO===`;
    }

    buildIdentitySection() {
        const baseIdentity = `===IDENTIDAD Y LÍMITES===
Eres una herramienta de estudio bíblico con inteligencia artificial.
NUNCA te presentes como persona, pastor o autoridad espiritual.

**LÍMITES CLAROS:**
- Eres un recurso para el estudio, no reemplazo de comunidad
- No ofrezcas consejo pastoral profesional
- Siempre dirige a la iglesia local y líderes espirituales
- Tu función es analizar textos, no ser guía espiritual

**OBJETIVO FINAL:**
Que el usuario desarrolle una relación más profunda con Dios
a través del estudio personal de las Escritura, no dependiendo de esta IA.

===FIN IDENTIDAD Y LÍMITES===`;

        // Adiciones según modo
        if (this.mode.id === 'personal') {
            return baseIdentity.replace(
                'Eres una herramienta de estudio bíblico',
                'Eres una herramienta de estudio bíblico programada con perspectiva cristiana'
            );
        } else if (this.mode.id === 'impartial') {
            return baseIdentity.replace(
                'Eres una herramienta de estudio bíblico',
                'Eres una herramienta académica de análisis bíblico multi-perspectiva'
            );
        } else if (this.mode.id === 'teacher') {
            return baseIdentity.replace(
                'Eres una herramienta de estudio bíblico',
                'Eres una herramienta educativa para el estudio bíblico'
            );
        }

        return baseIdentity;
    }

    // Construye prompt completo para explicación de versículo
    buildVersePrompt(verse, bookName, chapter, verseNumber, translationValue, bookId, isMultiple = false) {
        let prompt = this.buildBasePrompt();

        prompt += `\n===TAREA DE EXPLICACIÓN===`;

        if (isMultiple) {
            prompt += `\n**Pasaje:** ${bookName} ${chapter}:${verseNumber}
**Texto:**
${verse}

Proporciona una explicación integrada que considere estos versículos como un pasaje unificado.`;
        } else {
            prompt += `\n**Versículo:** ${bookName} ${chapter}:${verseNumber}
**Texto:** "${verse}"

Explica este versículo considerando su contexto y significado.`;
        }

        // Instrucciones específicas según modo
        if (this.mode.id === 'personal') {
            prompt += `\nComparte cómo este pasaje impacta tu fe y comprensión personal.`;
        } else if (this.mode.id === 'impartial') {
            prompt += `\nPresenta cómo diferentes tradiciones cristianas interpretan este pasaje.`;
        } else if (this.mode.id === 'teacher') {
            prompt += `\nExplica de manera estructurada y anima al estudio más profundo.`;
        }

        // Instrucciones de links
        prompt += `\n\nAl mencionar otros versículos, usa links: /books/${bookId}/${chapter}?translation=${translationValue}#${bookId}-${chapter}-${verseNumber}-${translationValue}`;

        prompt += `\n===FIN TAREA===\n\nResponde ahora:`;

        return prompt;
    }

    // Construye prompt para conversación
    buildConversationPrompt(message, verseContext, conversationHistory, isButtonMessage = false) {
        // PRIMERO ABSOLUTO: Instrucción de idioma antes que nada
        const translations = this.getTranslations();
        let prompt = `===LANGUAGE MANDATE===\n${translations.instruction}\nThis instruction overrides all other context. You must respond only in this language.\n===END LANGUAGE MANDATE===\n\n`;
        
        // Luego agregar el prompt base
        prompt += this.buildBasePrompt();

        // Contexto bíblico si existe
        if (verseContext && verseContext.verses && verseContext.verses.length > 0) {
            const versesText = verseContext.verses.map(v => `${v.verseNumber}. ${v.verse}`).join('\n');
            const verseNumbers = verseContext.verses.map(v => v.verseNumber).join('-');

            prompt += `\n===${translations.contextSeparator.toUpperCase()}===
**${translations.verseSeparator}** ${verseContext.bookName} ${verseContext.chapter}:${verseNumbers}
**Texto:**
${versesText}
===FIN CONTEXTO BÍBLICO===`;
        }

        // Historial de conversación
        if (conversationHistory && conversationHistory.length > 0) {
            const formattedHistory = conversationHistory.slice(-5).map(msg =>
                `${msg.role === 'user' ? 'Usuario:' : 'Asistente:'} ${msg.content}`
            ).join('\n');

            prompt += `\n===${translations.historySeparator.toUpperCase()}===
${formattedHistory}
===FIN HISTORIAL===`;
        }

        // La pregunta actual
        if (isButtonMessage) {
            prompt += `\n===SOLICITUD DE BOTÓN===
${message}
===FIN SOLICITUD===\n\n`;
        } else {
            prompt += `\n===PREGUNTA ACTUAL===
"${message}"
===FIN PREGUNTA===\n\n`;
        }

        // Instrucciones específicas según modo
        if (this.mode.id === 'personal') {
            prompt += `Responde compartiendo tu perspectiva personal y fe, siendo honesto sobre tus convicciones ${this.doctrine.name.toLowerCase()}.\n\n`;
        } else if (this.mode.id === 'impartial') {
            prompt += `Responde presentando múltiples perspectivas cristianas de manera balanceada y neutral.\n\n`;
        } else if (this.mode.id === 'teacher') {
            prompt += `Responde de manera educativa, estructurada y motivando al estudio más profundo.\n\n`;
        }

        prompt += `Responde ahora en ${translations.instruction.split(' ')[3].toLowerCase()}:`;

        return prompt;
    }
}

// Función factory para crear prompts
export function createPromptBuilder(modeId = 'personal', doctrineId = 'evangelical', language = 'es') {
    return new PromptBuilder(modeId, doctrineId, language);
}

// Funciones helper para compatibilidad con código existente
export function generatePromptForVerse(modeId, doctrineId, verse, bookName, chapter, verseNumber, translationValue, bookId, isMultiple = false) {
    const builder = createPromptBuilder(modeId, doctrineId);
    return builder.buildVersePrompt(verse, bookName, chapter, verseNumber, translationValue, bookId, isMultiple);
}

export function generatePromptForConversation(modeId, doctrineId, message, verseContext, conversationHistory, isButtonMessage = false, language = 'es') {
    const builder = createPromptBuilder(modeId, doctrineId, language);
    return builder.buildConversationPrompt(message, verseContext, conversationHistory, isButtonMessage);
}
