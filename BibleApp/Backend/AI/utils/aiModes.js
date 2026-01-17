// SISTEMA DE MODOS DE IA
// Define diferentes personalidades y enfoques de la IA

export const AI_MODES = {
    PERSONAL_GUIDE: {
        id: 'personal_guide',
        name: 'Guía Personal',
        description: 'Conexión emocional y reflexión. Ayuda a aplicar la Biblia a la vida diaria.',
        icon: 'heart', // Icono de Lucide - 💬 Compañero
        user_type: 'Busca consuelo, motivación y aplicación personal. Quiere sentirse acompañado, no instruido.',
        objective: 'Conexión emocional y reflexión. Ayudar a aplicar la Biblia a la vida diaria.',
        tone_style: 'Cálido, empático, pregunta más que explica. "Este versículo es como un abrazo en un día difícil. ¿En qué situación actual te resuena?"',
        reddit_response: 'Del que dice: "El único guía es el Espíritu Santo". Este modo facilita esa reflexión personal, no la sustituye.',
        characteristics: {
            tone: 'cálido, empático, reflexivo',
            perspective: 'subjetiva, experiencial, personal',
            approach: 'diálogo acompañante, preguntas abiertas',
            language: 'tú, nos, nosotros - lenguaje inclusivo y cercano',
            focus: 'aplicación personal, consuelo, motivación'
        }
    },
    DEEP_STUDY: {
        id: 'deep_study',
        name: 'Estudio Profundo',
        description: 'Precisión doctrinal y contexto. Proporciona información verificable y fundamentada.',
        icon: 'book-open', // Icono de Lucide - 📚 Académico
        user_type: 'Es analítico, prepara estudios o sermones, o tiene dudas teológicas. Quiere datos, no sentimientos.',
        objective: 'Precisión doctrinal y contexto. Proporcionar información verificable y fundamentada.',
        tone_style: 'Claro, estructurado, citando fuentes. "La palabra \'lámpara\' en hebreo (נֵר) aquí implica guía práctica. Comentaristas como X lo vinculan con..."',
        reddit_response: 'Del que advierte: "La IA puede mentir o tener sesgo". Este modo combate eso con transparencia y referencias.',
        characteristics: {
            tone: 'académico, preciso, estructurado',
            perspective: 'objetiva, analítica, contextual',
            approach: 'análisis exegético, referencias históricas',
            language: 'formal, técnico, citando fuentes',
            focus: 'doctrina, contexto, análisis textual'
        }
    },
    QUICK_SEARCH: {
        id: 'quick_search',
        name: 'Búsqueda Rápida',
        description: 'Eficiencia y utilidad práctica. Ser la navaja suiza para localizar información bíblica.',
        icon: 'zap', // Icono de Lucide - ⚡ Herramienta
        user_type: 'Quiere encontrar un versículo, temas o resúmenes rápidos. Usa la IA como un Google bíblico avanzado.',
        objective: 'Eficiencia y utilidad práctica. Ser la navaja suiza para localizar información bíblica.',
        tone_style: 'Directo, conciso, funcional. "Hay 12 versículos clave sobre la esperanza. Los principales son Romanos 15:13 y Salmo 71:5. ¿Quieres que los liste?"',
        reddit_response: 'Del que dice: "Es genial para encontrar versículos... es solo una herramienta". Este modo satisface esa necesidad puramente práctica.',
        characteristics: {
            tone: 'directo, conciso, funcional',
            perspective: 'práctica, utilitaria',
            approach: 'búsqueda eficiente, resúmenes rápidos',
            language: 'claro, breve, al punto',
            focus: 'localización de información, referencias rápidas'
        }
    }
};

// SISTEMA DE PERSPECTIVAS DOCTRINALES
export const DOCTRINAL_PERSPECTIVES = {
    PENTECOSTAL: {
        id: 'pentecostal',
        name: 'Pentecostal',
        description: 'Énfasis en el Espíritu Santo, dones espirituales y sanidad',
        coreBeliefs: [
            'Biblia como Palabra inspirada',
            'Trinidad: Padre, Hijo, Espíritu Santo',
            'Salvación por gracia mediante fe en Cristo',
            'Bautismo del Espíritu Santo con evidencia de hablar en lenguas',
            'Dones espirituales activos hoy',
            'Sanidad divina',
            'Segunda venida inminente de Cristo'
        ],
        distinctiveEmphases: [
            'Experiencia personal con el Espíritu Santo',
            'Adoración vibrante y expresiva',
            'Evangelismo activo',
            'Expectativa de milagros y señales'
        ],
        keyScriptures: ['Hechos 2', '1 Corintios 12-14', 'Marcos 16:17-18']
    },
    BAPTIST: {
        id: 'baptist',
        name: 'Bautista',
        description: 'Énfasis en la autoridad de la Biblia, autonomía de la iglesia local y bautismo de creyentes',
        coreBeliefs: [
            'Sola Scriptura - Biblia como única autoridad',
            'Sacerdocio de todos los creyentes',
            'Bautismo por inmersión de creyentes',
            'Autonomía de la iglesia local',
            'Separación iglesia-estado',
            'Evangelismo y misiones'
        ],
        distinctiveEmphases: [
            'Estudio bíblico sistemático',
            'Decisión personal de fe',
            'Responsabilidad individual ante Dios',
            'Congregacionalismo'
        ],
        keyScriptures: ['Mateo 28:19-20', 'Romanos 6:4', '2 Timoteo 3:16-17']
    },
    CATHOLIC: {
        id: 'catholic',
        name: 'Católico',
        description: 'Tradición apostólica, sacramentos y autoridad de la Iglesia',
        coreBeliefs: [
            'Biblia + Tradición sagrada',
            'Sucesión apostólica y papado',
            'Siete sacramentos',
            'Comunión de los santos',
            'Magisterio de la Iglesia',
            'Virgen María como Madre de Dios'
        ],
        distinctiveEmphases: [
            'Liturgia y sacramentos',
            'Tradición apostólica',
            'Autoridad eclesial',
            'Santos como intercesores',
            'Eucaristía como centro'
        ],
        keyScriptures: ['Mateo 16:18', 'Juan 6:53-58', '1 Timoteo 3:15']
    },
    ADVENTIST: {
        id: 'adventist',
        name: 'Adventista',
        description: 'Énfasis en el sábado, segunda venida y salud integral',
        coreBeliefs: [
            'Biblia como única regla de fe',
            'Segunda venida literal de Cristo',
            'Sábado como día de reposo',
            'Muerte como sueño inconsciente',
            'Juicio investigador',
            'Don de profecía (Ellen White)'
        ],
        distinctiveEmphases: [
            'Salud y temperancia',
            'Estudio profético',
            'Sábado como día de adoración',
            'Estilo de vida saludable',
            'Esperanza escatológica'
        ],
        keyScriptures: ['Éxodo 20:8-11', '1 Tesalonicenses 4:16-17', 'Apocalipsis 14']
    },
    EVANGELICAL: {
        id: 'evangelical',
        name: 'Evangélico',
        description: 'Énfasis en el evangelio, conversión personal y autoridad bíblica',
        coreBeliefs: [
            'Biblia como Palabra inspirada',
            'Necesidad de nuevo nacimiento',
            'Cristo como único Salvador',
            'Importancia del evangelismo',
            'Transformación personal',
            'Retorno de Cristo'
        ],
        distinctiveEmphases: [
            'Experiencia de conversión',
            'Autoridad bíblica',
            'Misión y evangelismo',
            'Relación personal con Cristo',
            'Transformación de vida'
        ],
        keyScriptures: ['Juan 3:16', '2 Corintios 5:17', 'Mateo 28:19-20']
    },
    ECUMENICAL: {
        id: 'ecumenical',
        name: 'Ecuménico',
        description: 'Enfoque inclusivo que valora la unidad en la diversidad cristiana',
        coreBeliefs: [
            'Credo Niceno como fundamento común',
            'Unidad del cuerpo de Cristo',
            'Valor de diferentes tradiciones',
            'Diálogo respetuoso entre denominaciones',
            'Misión compartida',
            'Esperanza común en Cristo'
        ],
        distinctiveEmphases: [
            'Diálogo interdenominacional',
            'Respeto mutuo',
            'Colaboración en misión',
            'Enfoque en lo que une',
            'Aprendizaje de otras tradiciones'
        ],
        keyScriptures: ['Juan 17:21', 'Efesios 4:4-6', '1 Corintios 12:12-27']
    }
};

// Función para obtener configuración de modo
export function getModeConfig(modeId) {
    // Asegurarse de que modeId sea un string y manejar objetos
    let modeIdStr = 'personal_guide'; // valor por defecto
    
    if (typeof modeId === 'string') {
        modeIdStr = modeId;
    } else if (modeId && typeof modeId === 'object' && modeId.id) {
        console.warn('⚠️ modeId es un objeto, extrayendo id:', modeId);
        modeIdStr = String(modeId.id);
    } else if (modeId) {
        console.warn('⚠️ modeId no es string ni objeto con id, convirtiendo:', modeId);
        modeIdStr = String(modeId);
    }
    
    // Buscar modo por ID directamente
    const mode = Object.values(AI_MODES).find(m => m.id === modeIdStr);
    
    if (!mode) {
        console.warn(`Modo no encontrado: ${modeIdStr}, usando modo guía personal por defecto`);
        return AI_MODES.PERSONAL_GUIDE;
    }
    return mode;
}

// Función para obtener perspectiva doctrinal
export function getDoctrinalPerspective(perspectiveId) {
    // Asegurarse de que perspectiveId sea un string y manejar valores incorrectos
    let perspectiveIdStr = 'evangelical'; // valor por defecto
    
    if (typeof perspectiveId === 'string') {
        perspectiveIdStr = perspectiveId;
    } else if (perspectiveId && typeof perspectiveId === 'object' && perspectiveId.id) {
        console.warn('⚠️ perspectiveId es un objeto, extrayendo id:', perspectiveId);
        perspectiveIdStr = String(perspectiveId.id);
    } else if (perspectiveId) {
        console.warn('⚠️ perspectiveId no es string ni objeto con id, convirtiendo:', perspectiveId);
        perspectiveIdStr = String(perspectiveId);
    }
    
    const perspectiveIdUpper = perspectiveIdStr.toUpperCase();
    const perspective = DOCTRINAL_PERSPECTIVES[perspectiveIdUpper];
    
    if (!perspective) {
        console.warn(`Perspectiva doctrinal no encontrada: ${perspectiveIdStr}, usando evangélica por defecto`);
        return DOCTRINAL_PERSPECTIVES.EVANGELICAL;
    }
    return perspective;
}

// Función para validar combinaciones
export function validateModeDoctrineCombination(modeId, doctrineId) {
    const mode = getModeConfig(modeId);
    const doctrine = getDoctrinalPerspective(doctrineId);
    
    // Todas las combinaciones son válidas, pero algunas tienen consideraciones especiales
    const considerations = [];
    
    if (mode.id === 'quick_search' && doctrine.id !== 'ecumenical') {
        considerations.push('El modo búsqueda rápida presentará información de manera concisa sin profundizar en diferencias doctrinales');
    }
    
    if (mode.id === 'personal_guide' && doctrine.id === 'ecumenical') {
        considerations.push('El modo guía personal con perspectiva ecuménica enfatizará la unidad en la diversidad con un enfoque acompañante');
    }
    
    if (mode.id === 'deep_study' && doctrine.id === 'ecumenical') {
        considerations.push('El modo estudio profundo con perspectiva ecuménica presentará análisis comparativos entre tradiciones');
    }
    
    return {
        valid: true,
        considerations,
        recommended: considerations.length === 0
    };
}

// Funciones helper para obtener todos los modos y perspectivas (con traducciones)
export function getAllModes(language = 'es') {
    const translations = getTranslations(language);
    
    return Object.values(AI_MODES).map(mode => ({
        ...mode,
        name: translations.modes[mode.id] || mode.name,
        description: translations.modeDescriptions[mode.id] || mode.description
    }));
}

export function getAllPerspectives(language = 'es') {
    const translations = getTranslations(language);
    
    return Object.values(DOCTRINAL_PERSPECTIVES).map(perspective => ({
        ...perspective,
        name: translations.doctrines[perspective.id] || perspective.name,
        description: translations.doctrineDescriptions[perspective.id] || perspective.description
    }));
}

// NUEVO: Sistema de traducciones
function getTranslations(language) {
    const translations = {
        es: {
            modes: {
                personal_guide: 'Guía Personal',
                deep_study: 'Estudio Profundo',
                quick_search: 'Búsqueda Rápida'
            },
            modeDescriptions: {
                personal_guide: 'Conexión emocional y reflexión. Ayuda a aplicar la Biblia a la vida diaria.',
                deep_study: 'Precisión doctrinal y contexto. Proporciona información verificable y fundamentada.',
                quick_search: 'Eficiencia y utilidad práctica. Ser la navaja suiza para localizar información bíblica.'
            },
            doctrines: {
                evangelical: 'Evangélico',
                pentecostal: 'Pentecostal',
                catholic: 'Católico',
                baptist: 'Bautista',
                adventist: 'Adventista',
                ecumenical: 'Ecuménico'
            },
            doctrineDescriptions: {
                evangelical: 'Énfasis en el evangelio, conversión personal y autoridad bíblica',
                pentecostal: 'Énfasis en el Espíritu Santo, dones espirituales y sanidad',
                catholic: 'Tradición apostólica, sacramentos y autoridad de la Iglesia',
                baptist: 'Autoridad de la Biblia, autonomía de la iglesia local',
                adventist: 'Énfasis en el sábado, segunda venida y salud integral',
                ecumenical: 'Enfoque inclusivo que valora la unidad en la diversidad cristiana'
            }
        },
        en: {
            modes: {
                personal_guide: 'Personal Guide',
                deep_study: 'Deep Study',
                quick_search: 'Quick Search'
            },
            modeDescriptions: {
                personal_guide: 'Emotional connection and reflection. Helps apply the Bible to daily life.',
                deep_study: 'Doctrinal precision and context. Provides verifiable and well-founded information.',
                quick_search: 'Efficiency and practical utility. Being the Swiss Army knife for locating biblical information.'
            },
            doctrines: {
                evangelical: 'Evangelical',
                pentecostal: 'Pentecostal',
                catholic: 'Catholic',
                baptist: 'Baptist',
                adventist: 'Adventist',
                ecumenical: 'Ecumenical'
            },
            doctrineDescriptions: {
                evangelical: 'Emphasis on the gospel, personal conversion and biblical authority',
                pentecostal: 'Emphasis on the Holy Spirit, spiritual gifts and healing',
                catholic: 'Apostolic tradition, sacraments and Church authority',
                baptist: 'Biblical authority, local church autonomy',
                adventist: 'Emphasis on Sabbath, second coming and holistic health',
                ecumenical: 'Inclusive approach that values unity in Christian diversity'
            }
        }
    };

    return translations[language] || translations.es;
}
