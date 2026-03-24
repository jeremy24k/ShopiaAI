import { useLanguageStore } from '../store/LanguageStore';
import { translations } from '../locales/translations';

export function useTranslation() {
  const language = useLanguageStore(state => state.language);
  const setLanguage = useLanguageStore(state => state.setLanguage);
  const toggleLanguage = useLanguageStore(state => state.toggleLanguage);

  // Función para obtener traducción por key
  const t = (key, fallback) => {
    return translations[language]?.[key] || fallback || key;
  };

  return {
    t,           // función de traducción
    language,    // idioma actual ('es' o 'en')
    setLanguage, // cambiar idioma manualmente
    toggleLanguage // alternar entre es/en
  };
}
