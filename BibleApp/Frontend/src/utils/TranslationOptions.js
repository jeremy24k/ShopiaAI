function getTranslationOptions(translations) {
    const translationOptions = translations
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((translation) => ({
        value: translation.id,
        label: translation.name,
    }));
    
    return translationOptions;
}

export default getTranslationOptions;