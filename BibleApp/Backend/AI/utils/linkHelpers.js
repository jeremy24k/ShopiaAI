// Helper para generación de enlaces en formato markdown compatibles con el frontend

export function getLinkInstructions(bookName, chapter, verseNumber, bookId, translationValue, language = 'es') {
    const bookIdLower = bookId ? bookId.toLowerCase() : 'gen';
    const defaultTrans = language === 'en' ? 'eng_web' : 'spa_r09';
    const translationLower = translationValue ? translationValue.toLowerCase() : defaultTrans;

    return `
===GENERACIÓN DE ENLACES (STREAMDOWN)===
    CRÍTICO: Cada vez que menciones un versículo bíblico (el actual o uno de referencia), DEBES convertirlo en un enlace de Markdown.

    FORMATOS DE ENLACE:

    1. VERSÍCULO INDIVIDUAL:
    [Libro Cap:Vers](/books/BOOKID/CHAPTER?translation=${translationLower}#BOOKID-VERSE-${translationLower})

    2. RANGO DE VERSÍCULOS CONSECUTIVOS (mismo capítulo):
    [Libro Cap:VerInicio-VerFin](/books/BOOKID/CHAPTER?translation=${translationLower}#BOOKID-VERINICIO-VERFIN-${translationLower})

    3. CAPÍTULO COMPLETO (sin versículo específico, SIN hash):
    [Libro Cap](/books/BOOKID/CHAPTER?translation=${translationLower})

    4. RANGO DE CAPÍTULOS: genera un enlace por cada capítulo o enlaza al primero del rango:
    [Libro Cap1-CapN](/books/BOOKID/CAP1?translation=${translationLower})

    REGLAS IMPORTANTES:
    - El hash (#) SOLO se usa para versículos, NUNCA para capítulos.
    - Cuando mencionas un capítulo entero (ej: "Génesis 37"), NO pongas hash. Solo: /books/gen/37?translation=...
    - Cuando mencionas un rango de capítulos (ej: "Génesis 42-45"), enlaza al primer capítulo SIN hash.
    - Cuando mencionas versículos consecutivos (ej: "Romanos 8:28-30"), usa el formato de rango con hash.
    - NUNCA mezcles números de capítulos en el hash. El hash es SOLO para versículos dentro del capítulo de la URL.

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

    EJEMPLOS DE ENLACES DE VERSÍCULOS:
    - El versículo actual: [${bookName} ${chapter}:${verseNumber}](/books/${bookIdLower}/${chapter}?translation=${translationLower}#${bookIdLower}-${verseNumber}-${translationLower})
    - Juan 3:16: [Juan 3:16](/books/jhn/3?translation=${translationLower}#jhn-16-${translationLower})
    - Génesis 1:1: [Génesis 1:1](/books/gen/1?translation=${translationLower}#gen-1-${translationLower})

    EJEMPLOS DE ENLACES CON RANGO DE VERSÍCULOS:
    - Romanos 8:28-30: [Romanos 8:28-30](/books/rom/8?translation=${translationLower}#rom-28-30-${translationLower})
    - 1 Juan 4:9-11: [1 Juan 4:9-11](/books/1jn/4?translation=${translationLower}#1jn-9-11-${translationLower})
    - Filipenses 4:4-7: [Filipenses 4:4-7](/books/php/4?translation=${translationLower}#php-4-7-${translationLower})

    EJEMPLOS DE ENLACES DE CAPÍTULOS (SIN hash):
    - Génesis 37: [Génesis 37](/books/gen/37?translation=${translationLower})
    - Génesis 42-45: [Génesis 42-45](/books/gen/42?translation=${translationLower})
    - Hechos 7: [Hechos 7](/books/act/7?translation=${translationLower})

    INSTRUCCIÓN DE RENDERIZACIÓN:
    Usa solo el formato estándar de Markdown [Texto](URL). No intentes añadir etiquetas HTML como target="_blank", el sistema se encarga de eso.
===FIN GENERACIÓN DE ENLACES===`;
}
