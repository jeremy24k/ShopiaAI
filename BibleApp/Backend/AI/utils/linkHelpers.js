// Helper para generación de enlaces en formato markdown compatibles con el frontend

export function getLinkInstructions(bookName, chapter, verseNumber, bookId, translationValue) {
    const bookIdLower = bookId ? bookId.toLowerCase() : 'gen';
    const translationLower = translationValue ? translationValue.toLowerCase() : 'spa_r09';

    return `
===GENERACIÓN DE ENLACES (STREAMDOWN)===
CRÍTICO: Cada vez que menciones un versículo bíblico (el actual o uno de referencia), DEBES convertirlo en un enlace de Markdown.

FORMATO OBLIGATORIO:
[Libro Capítulo:Versículo](/books/BOOKID/CHAPTER?translation=${translationLower}#BOOKID-CHAPTER-VERSE-${translationLower})

REGLAS DE BOOKID:
- Usa siempre códigos de 3 letras en minúsculas (ej: gen, exo, lev, mat, mar, luk, joh, rom, pro, psa, etc.).
- Para el contexto actual (${bookName}): el BOOKID es "${bookIdLower}".

EJEMPLOS DE ENLACES:
- El versículo actual: [${bookName} ${chapter}:${verseNumber}](/books/${bookIdLower}/${chapter}?translation=${translationLower}#${bookIdLower}-${chapter}-${verseNumber}-${translationLower})
- Referencia externa (ej. Juan 3:16): [Juan 3:16](/books/joh/3?translation=${translationLower}#joh-3-16-${translationLower})
- Referencia externa (ej. Salmos 23:1): [Salmos 23:1](/books/psa/23?translation=${translationLower}#psa-23-1-${translationLower})

INSTRUCCIÓN DE RENDERIZACIÓN:
Usa solo el formato estándar de Markdown [Texto](URL). No intentes añadir etiquetas HTML como target="_blank", el sistema se encarga de eso.
===FIN GENERACIÓN DE ENLACES===`;
}
