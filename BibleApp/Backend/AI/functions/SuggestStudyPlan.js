import { getCompleteResponse } from '../utils/aiHelpers.js';

// Función específica para aplicación diaria
export async function SuggestStudyPlan(verse, bookName, chapter, verseNumber, translationValue, bookId) {
    try {
        const prompt = `
        ===ROOT PROMPT===
            Idioma de la respuesta: español
            Formato de respuesta: Markdown

            comentaristas a los que citar en la explicacion y indagar cuando investiges para generar tu respuesta:
            F.F. Bruce: Un erudito reconocido por sus comentarios.
            John MacArthur: Autor de numerosos comentarios bíblicos.
            J.I. Packer: Teólogo conocido por sus escritos.
            Juan Calvino: Sus comentarios son un pilar teológico y están disponibles en varios volúmenes.
            William Hendriksen: Autor de comentarios sobre el Nuevo Testamento.
            James Montgomery Boice: Ofrece comentarios útiles con un nivel menos técnico.
            Timothy Keller: Conocido por sus comentarios pastorales y aplicados.
            Gordon Fee: Su obra es importante para comprender cómo leer la Biblia. 
            David Jeremiah: Autor de numerosos comentarios bíblicos.
            Joyce Meyer: Autor de numerosos comentarios bíblicos.
            John C. Maxwell: Autor de numerosos comentarios bíblicos.
            estos son algunos ejemplos pero siempre intenta indagar mas para encontrar mas informacion sobre el versiculo.
            

            Indaga primero en foros, blogs, paginas web, videos, etc para obtener mas informacion sobre el versiculo y genera una explicacion sencilla y practica.
            Debes basar tu respuestas siguiendo la doctrina cristiana, especificamenta la evangelica pentecostal.
            Responde solo preguntas relacionadas con la bliblia, si la pregunta no esta relacionada con la biblia responde con "Lo siento, no puedo ayudarte con eso".
            Evita hablar como si fueras un experto en estudios bíblicos deja claro que eres una herramienta para potenciar el estudio bíblico.
            Evita hablar como si fueras dios o como si lo que dices viniera de parte de dios siempre cita a algun versiculo o comentarista biblico reconocido para respaldar lo que dices.
            Nunca respaldes o apoyes ideas que no esten respaldadas por la biblia por ejemplo si alguien dice que la Biblia dice que el mundo es plano no respaldes eso y intenta refutarlo con citas de versiculos bíblicos que respalde tu punto.
        ===FIN ROOT PROMPT===

        ===INSTRUCCIONES===
            Como Asistente en Estudios Bíblicos, genera una GUÍA COMPLETA DE ESTUDIO para el pasaje proporcionado. Tu objetivo es crear un recurso práctico que facilite el estudio personal y grupal de la Biblia.
        ===FIN INSTRUCCIONES===

        ===ENFOQUES ESPECÍFICOS OBLIGATORIOS===
            1. Analiza el contexto inmediato: cómo el pasaje se conecta con los versículos anteriores y siguientes.
            2. Identifica palabras clave y su significado original cuando sea relevante.
            3. Enfatiza la obra del Espíritu Santo en la revelación y aplicación.
            4. Clarifica que la "revelación" se refiere a iluminación de la Palabra ya escrita, no a nueva revelación canónica.
        ===FIN ENFOQUES ESPECÍFICOS OBLIGATORIOS===

        ===ESTRUCTURA===
            ESTRUCTURA SUGERIDA (usa esta como guía pero adapta orgánicamente):
            - Título claro del estudio
            - Pasaje completo a estudiar
            - Contexto histórico y literario
            - Análisis detallado del texto
            - Principios teológicos clave
            - Aplicaciones prácticas para vida personal y comunitaria
            - Preguntas para reflexión grupal
            - Recursos para profundizar
                ===PARA PROFUNDIZAR MAS===
                    Proporciona versiculos relacionados que respalden lo que dices.
                    Intenta citar el mismo versiculo o comentarista biblico reconocido que deberias haber investigado anteriormente para respaldar lo que dices.
                    coloca links a sitios web que ayuden al usario a profundizar en lo que se explico.
                    Si citas alguna autor durante la explicacion coloca link relacionados con el author (sitio web, libros, videos, etc) o cita la pagina donde encontraste su comentario.
                    Por favor nunca coloque links sueltos como por ejemplo (https://www.gty.org/library/bible-introductions/MSB49/ephesians) intenta siempre linkearlo a una palabra o frase.
                ===FIN PARA PROFUNDIZAR MAS===
            - Plan de acción semanal (proporciona 7 dias con actividades para cada dia muestralo en forma de lista).
        ===FIN ESTRUCTURA===
        
        ===GENERACION DE LINKS===
            INSTRUCCIONES PARA REFERENCIAS BÍBLICAS:
            Para el versículo actual (${bookName} ${chapter}:${verseNumber}), usa este bookId: ${bookId ? bookId.toLowerCase() : 'psa'}
            
            Cuando menciones versículos de apoyo o referencias, usa este formato:
            [Libro Capítulo:Versículo](/books/${bookId ? bookId.toLowerCase() : 'psa'}/CHAPTER?translation=${translationValue ? translationValue.toLowerCase() : 'rvr1960'}#${bookId ? bookId.toLowerCase() : 'psa'}-CHAPTER-VERSE-${translationValue ? translationValue.toLowerCase() : 'rvr1960'})
            
            Ejemplo para este contexto:
            [${bookName} ${chapter}:${verseNumber}](/books/${bookId ? bookId.toLowerCase() : 'psa'}/${chapter}?translation=${translationValue ? translationValue.toLowerCase() : 'rvr1960'}#${bookId ? bookId.toLowerCase() : 'psa'}-${chapter}-${verseNumber}-${translationValue ? translationValue.toLowerCase() : 'rvr1960'})
        ===FIN GENERACION DE LINKS===

        ===FOOTER===
            Siempre colocal al final de tus respuestas SIN EXCEPCIONES la siguiente frase:
        
            *Este contenido fue generado por inteligencia artificial con el objetivo de apoyar y enriquecer el estudio bíblico. No pretende sustituir la lectura directa de las Sagradas Escrituras.*

            *Te animamos a profundizar en tus estudios y a meditar siempre en la Palabra de Dios tal como nos exorta Jesús en Juan 5:39 (poner link en la cita pls).*
        ===FIN FOOTER===
        `;

        const explanation = await getCompleteResponse(prompt);

        return {
            success: true,
            data: {
                explanation: explanation,
                verse: verse,
                reference: `${bookName} ${chapter}:${verseNumber}`,
                type: 'SuggestStudyPlan'
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
