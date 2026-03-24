// Helper para generación de enlaces en formato markdown compatibles con el frontend

export function getLinkInstructions(bookName, chapter, verseNumber, bookId, translationValue, language = 'es') {
    const bookIdLower = bookId ? bookId.toLowerCase() : 'gen';
    const defaultTrans = language === 'en' ? 'eng_web' : 'spa_r09';
    const translationLower = translationValue ? translationValue.toLowerCase() : defaultTrans;

    return `
===GENERACIÓN DE ENLACES (STREAMDOWN)===
    CRÍTICO: Cada vez que menciones un versículo bíblico (el actual o uno de referencia), DEBES convertirlo en un enlace de Markdown.

    FORMATO OBLIGATORIO:
    [Libro Capítulo:Versículo](/books/BOOKID/CHAPTER?translation=${translationLower}#BOOKID-CHAPTER-VERSE-${translationLower})

    REGLAS DE BOOKID (códigos en minúsculas para URLs):
    - ANTIGUO TESTAMENTO:
      * Pentateuco: gen, exo, lev, num, deu
      * Históricos: jos, jdg, rut, 1sa, 2sa, 1ki, 2ki, 1ch, 2ch, ezr, neh, est
      * Poéticos: job, psa, pro, ecc, sng
      * Profetas Mayores: isa, jer, lam, ezk, dan
      * Profetas Menores: hos, jol, amo, oba, jon, mic, nam, hab, zep, hag, zec, mal
    - NUEVO TESTAMENTO:
      * Evangelios: mat, mrk, luk, jhn
      * Hechos: act
      * Cartas de Pablo: rom, 1co, 2co, gal, eph, php, col, 1th, 2th, 1ti, 2ti, tit, phm
      * Cartas Universales: heb, jas, 1pe, 2pe, 1jn, 2jn, 3jn, jud
      * Profético: rev
    - LIBROS DEUTEROCANÓNICOS/APÓCRIFOS:
      * tob (Tobit), jdt (Judit), esg (Ester griega), wis (Sabiduría), sir (Sirácide/Eclesiástico)
      * bar (Baruc), 1ma, 2ma, 3ma, 4ma (Macabeos), 1es, 2es (Esdras)
      * man (Oración de Manasés), ps2 (Salmo 151), dag (Daniel griego)
    - Para el contexto actual (${bookName}): el BOOKID es "${bookIdLower}".

    EJEMPLOS DE ENLACES:
    - El versículo actual: [${bookName} ${chapter}:${verseNumber}](/books/${bookIdLower}/${chapter}?translation=${translationLower}#${bookIdLower}-${chapter}-${verseNumber}-${translationLower})
    - Juan 3:16: [Juan 3:16](/books/jhn/3?translation=${translationLower}#jhn-3-16-${translationLower})
    - Salmos 23:1: [Salmos 23:1](/books/psa/23?translation=${translationLower}#psa-23-1-${translationLower})
    - Génesis 1:1: [Génesis 1:1](/books/gen/1?translation=${translationLower}#gen-1-1-${translationLower})
    - Romanos 8:28: [Romanos 8:28](/books/rom/8?translation=${translationLower}#rom-8-28-${translationLower})
    - Tobit 1:1: [Tobit 1:1](/books/tob/1?translation=${translationLower}#tob-1-1-${translationLower})
    - 1 Macabeos 2:1: [1 Macabeos 2:1](/books/1ma/2?translation=${translationLower}#1ma-2-1-${translationLower})

    INSTRUCCIÓN DE RENDERIZACIÓN:
    Usa solo el formato estándar de Markdown [Texto](URL). No intentes añadir etiquetas HTML como target="_blank", el sistema se encarga de eso.
===FIN GENERACIÓN DE ENLACES===`;
}
