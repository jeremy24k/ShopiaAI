// SISTEMA DE MODOS DE IA
// Define diferentes personalidades y enfoques de la IA

export const AI_MODES = {
    PERSONAL: {
        id: 'personal',
        name: 'Modo Personal',
        description: 'La IA responde como un cristiano compartiendo su perspectiva personal',
        icon: 'user-round', // Icono de Lucide
        characteristics: {
            tone: 'personal, cálido, compartiendo experiencias',
            perspective: 'subjetiva, basada en fe personal',
            approach: 'dialogo amigable, testimonios personales',
            language: 'tú, nos, nosotros - lenguaje inclusivo'
        }
    },
    IMPARTIAL: {
        id: 'impartial',
        name: 'Modo Imparcial',
        description: 'La IA presenta múltiples perspectivas sin inclinarse por ninguna',
        icon: 'Scale', // Icono de Lucide
        characteristics: {
            tone: 'neutral, objetivo, académico',
            perspective: 'multi-perspectiva, balanceado',
            approach: 'análisis comparativo, presentación de opciones',
            language: 'formal, preciso, sin sesgos'
        }
    },
    TEACHER: {
        id: 'teacher',
        name: 'Modo Estudiantil',
        description: 'La IA actúa como un maestro que enseña y motiva a aprender más',
        icon: 'graduation-cap', // Icono de Lucide
        characteristics: {
            tone: 'educativo, motivador, paciente',
            perspective: 'pedagógico, progresivo',
            approach: 'instrucción estructurada, preguntas reflexivas',
            language: 'claro, didáctico, animando a la exploración'
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
    let modeIdStr = 'personal'; // valor por defecto
    
    if (typeof modeId === 'string') {
        modeIdStr = modeId;
    } else if (modeId && typeof modeId === 'object' && modeId.id) {
        console.warn('⚠️ modeId es un objeto, extrayendo id:', modeId);
        modeIdStr = String(modeId.id);
    } else if (modeId) {
        console.warn('⚠️ modeId no es string ni objeto con id, convirtiendo:', modeId);
        modeIdStr = String(modeId);
    }
    
    const modeIdUpper = modeIdStr.toUpperCase();
    const mode = AI_MODES[modeIdUpper];
    
    if (!mode) {
        console.warn(`Modo no encontrado: ${modeIdStr}, usando modo personal por defecto`);
        return AI_MODES.PERSONAL;
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
    
    if (mode.id === 'impartial' && doctrine.id !== 'ecumenical') {
        considerations.push('El modo imparcial presentará esta perspectiva como una entre varias opciones');
    }
    
    if (mode.id === 'personal' && doctrine.id === 'ecumenical') {
        considerations.push('El modo personal con perspectiva ecuménica enfatizará la unidad en la diversidad');
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
                personal: 'Modo Personal',
                impartial: 'Modo Imparcial',
                teacher: 'Modo Estudiantil'
            },
            modeDescriptions: {
                personal: 'La IA responde como un cristiano compartiendo su perspectiva personal',
                impartial: 'La IA presenta múltiples perspectivas sin inclinarse por ninguna',
                teacher: 'La IA actúa como un maestro que enseña y motiva a aprender más'
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
                personal: 'Personal Mode',
                impartial: 'Impartial Mode',
                teacher: 'Student Mode'
            },
            modeDescriptions: {
                personal: 'The AI responds as a Christian sharing their personal perspective',
                impartial: 'The AI presents multiple perspectives without favoring any',
                teacher: 'The AI acts as a teacher who instructs and motivates further learning'
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
