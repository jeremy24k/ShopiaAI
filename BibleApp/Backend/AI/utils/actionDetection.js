// Detección de tipos de tareas de IA para prompts y cobro de créditos

export const ACTION_TYPES = {
    HISTORICAL_CONTEXT: 'HistoricalContext',
    DAILY_APPLICATION: 'DailyApplication',
    SIMPLE_EXPLANATION: 'SimpleExplanation',
    RELATED_VERSES: 'RelatedVerses',
    ORIGINAL_LANGUAGE: 'OriginalLanguage',
    STUDY_PLAN: 'StudyPlan',
    MESSAGE: 'message'
};

export function extractButtonType(message) {
    if (!message) return null;

    const typeMap = {
        // IDs Técnicos y Etiquetas en Inglés/Español
        'historicalContext': ACTION_TYPES.HISTORICAL_CONTEXT,
        'Historical Context': ACTION_TYPES.HISTORICAL_CONTEXT,
        'Contexto Histórico': ACTION_TYPES.HISTORICAL_CONTEXT,

        'dailyApplication': ACTION_TYPES.DAILY_APPLICATION,
        'Daily Application': ACTION_TYPES.DAILY_APPLICATION,
        'Aplicación Diaria': ACTION_TYPES.DAILY_APPLICATION,

        'simpleExplanation': ACTION_TYPES.SIMPLE_EXPLANATION,
        'Simple Explanation': ACTION_TYPES.SIMPLE_EXPLANATION,
        'Explicación Sencilla': ACTION_TYPES.SIMPLE_EXPLANATION,

        'relatedVerses': ACTION_TYPES.RELATED_VERSES,
        'Related Verses': ACTION_TYPES.RELATED_VERSES,
        'Versículos Relacionados': ACTION_TYPES.RELATED_VERSES,

        'originalLanguage': ACTION_TYPES.ORIGINAL_LANGUAGE,
        'Original Language': ACTION_TYPES.ORIGINAL_LANGUAGE,
        'Idioma Original': ACTION_TYPES.ORIGINAL_LANGUAGE,

        'studyPlan': ACTION_TYPES.STUDY_PLAN,
        'Study Plan': ACTION_TYPES.STUDY_PLAN,
        'Guía de Estudio': ACTION_TYPES.STUDY_PLAN
    };

    const lowerMessage = message.toLowerCase();
    for (const [key, value] of Object.entries(typeMap)) {
        if (lowerMessage.includes(key.toLowerCase())) {
            return value;
        }
    }
    return null;
}
