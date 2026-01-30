function getTranslationOptions(translations, currentLanguage = 'es') {
    // 1. Normalizar códigos de idioma
    const getLanguageLabel = (code) => {
        if (!code) return 'Español';
        const lowerCode = code.toLowerCase().trim();
        if (['es', 'spa', 'spanish', 'español'].includes(lowerCode)) return 'Español';
        if (['en', 'eng', 'english', 'ingles'].includes(lowerCode)) return 'English';
        return lowerCode.toUpperCase();
    };

    const priorityGroupLabel = getLanguageLabel(currentLanguage);

    // 2. Agrupar traducciones
    const grouped = translations.reduce((acc, t) => {
        const label = getLanguageLabel(t.language);
        if (!acc[label]) acc[label] = [];

        acc[label].push({
            value: t.id,
            label: t.name,
            shortName: t.shortName
        });
        return acc;
    }, {});

    // 3. Ordenar grupos (Prioritario al inicio) y sus opciones (Alfabético)
    return Object.keys(grouped)
        .sort((a, b) => {
            if (a === priorityGroupLabel) return -1;
            if (b === priorityGroupLabel) return 1;
            return a.localeCompare(b);
        })
        .map(label => ({
            label: label,
            options: grouped[label].sort((a, b) => a.label.localeCompare(b.label))
        }));
}

export default getTranslationOptions;