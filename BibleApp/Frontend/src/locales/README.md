# Sistema de Internacionalización (i18n)

Sistema simple de traducciones para la aplicación de Biblia usando Zustand.

## 📁 Estructura

```
src/
├── locales/
│   └── translations.js          # Todas las traducciones (es/en)
├── store/
│   └── LanguageStore.jsx        # Store de Zustand para idioma
├── hooks/
│   └── useTranslation.js        # Hook personalizado
└── components/
    └── ui/
        └── LanguageSelector.jsx # Selector de idioma
```

## 🚀 Uso Básico

### 1. Importar el hook en tu componente

```javascript
import { useTranslation } from '../../hooks/useTranslation';

function MiComponente() {
  const { t } = useTranslation();
  
  return (
    <button>{t('mark_complete')}</button>
  );
}
```

### 2. Agregar nuevas traducciones

Edita `src/locales/translations.js`:

```javascript
export const translations = {
  es: {
    mi_nueva_key: "Mi texto en español"
  },
  en: {
    mi_nueva_key: "My text in English"
  }
};
```

### 3. Usar el selector de idioma

Importa y usa el componente `LanguageSelector` en tu layout o navbar:

```javascript
import LanguageSelector from './components/ui/LanguageSelector';

function Layout() {
  return (
    <nav>
      <LanguageSelector />
    </nav>
  );
}
```

## 🔧 API del Hook

```javascript
const { t, language, setLanguage, toggleLanguage } = useTranslation();
```

- **`t(key)`**: Obtiene la traducción para una key
- **`language`**: Idioma actual ('es' o 'en')
- **`setLanguage(lang)`**: Cambia el idioma manualmente
- **`toggleLanguage()`**: Alterna entre español e inglés

## 📝 Ejemplos

### Ejemplo 1: Texto simple
```javascript
<h1>{t('chapter_completed')}</h1>
// Español: "¡Capítulo completado!"
// English: "Chapter completed!"
```

### Ejemplo 2: Cambiar idioma programáticamente
```javascript
const { setLanguage } = useTranslation();

<button onClick={() => setLanguage('en')}>
  English
</button>
```

### Ejemplo 3: Alternar idioma
```javascript
const { toggleLanguage } = useTranslation();

<button onClick={toggleLanguage}>
  Toggle Language
</button>
```

## 💾 Persistencia

El idioma seleccionado se guarda automáticamente en `localStorage` usando Zustand persist middleware.

## ✅ Componentes Migrados

- ✅ ContinueReadingButton
- ✅ ChapterContent (parcial)
- 🔄 Resto de componentes (migrar gradualmente)

## 📋 Keys Disponibles

Ver archivo `translations.js` para la lista completa de keys disponibles.

### Categorías principales:
- **Navigation**: home, read, notes, login, logout
- **Reading**: continue_reading, select_translation, chapter, verse
- **Progress**: mark_complete, chapter_completed, completed
- **Authentication**: login_register_progress
- **Notes**: add_note, save_note, delete_note
- **Errors**: error, loading, book_not_found
- **Categories**: old_testament, new_testament, etc.

## 🎯 Próximos Pasos

1. Migrar resto de componentes gradualmente
2. Agregar más traducciones según sea necesario
3. Considerar agregar más idiomas en el futuro
