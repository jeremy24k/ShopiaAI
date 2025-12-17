# 📁 Estructura del Proyecto - BibleApp Frontend

## 🎯 Nueva Organización

```
src/
├── App.jsx                    # ✅ Componente principal de la aplicación
├── main.jsx                   # ✅ Punto de entrada
│
├── pages/                     # 📄 Páginas principales (rutas)
│   ├── Home.jsx              # Página de inicio
│   ├── Read.jsx              # Página de lectura de libros
│   ├── Notes.jsx             # Página de notas
│   ├── Favorites.jsx         # Página de favoritos
│   ├── AI.jsx                # Página de IA
│   ├── AI.css                # Estilos específicos de AI
│   └── Login.jsx             # Página de login
│
├── features/                  # 🎨 Componentes por característica
│   ├── books/                # Funcionalidad de libros
│   │   ├── BookCard.jsx
│   │   ├── BookGrid.jsx
│   │   ├── BookProgress.jsx
│   │   ├── Filter.jsx
│   │   ├── SearchComponent.jsx
│   │   ├── ActiveFiltersBadge.jsx
│   │   └── VerseContent.jsx
│   │
│   ├── chapters/             # Funcionalidad de capítulos
│   │   ├── ChapterContent.jsx
│   │   ├── ChapterGrid.jsx
│   │   └── ChapterNavigation.jsx
│   │
│   ├── home/                 # Componentes del Home
│   │   ├── DailyVerse.jsx
│   │   ├── DailyReadingTime.jsx
│   │   ├── StreakDisplay.jsx
│   │   ├── DisplayBooksMetrics.jsx
│   │   ├── RecentlyRead.jsx
│   │   ├── GreetingComponent.jsx
│   │   ├── HeroHome.jsx
│   │   └── ReadingStats.jsx
│   │
│   ├── notes/                # Funcionalidad de notas
│   │   ├── NoteContent.jsx
│   │   ├── NoteEditor.jsx
│   │   ├── NoteList.jsx
│   │   ├── NotePreview.jsx
│   │   ├── NoteVerses.jsx
│   │   ├── NoteViewer.jsx
│   │   └── WriteNotes.jsx
│   │
│   ├── favorites/            # Funcionalidad de favoritos
│   │   └── FavoriteVerses.jsx
│   │
│   └── ai/                   # Funcionalidad de IA (vacío por ahora)
│
├── hooks/                     # 🪝 Custom Hooks
│   ├── useUrlSync.js         # Sincronización URL → Store
│   ├── useChapterData.jsx    # Hook para datos de capítulos
│   ├── useChapterReading.jsx # Hook para lectura de capítulos
│   ├── useChapterTracking.jsx # Hook para tracking
│   ├── useFontSize.jsx       # Hook para tamaño de fuente
│   ├── useNavigationHistory.js # Hook para historial
│   ├── useProtectedAction.jsx # Hook para acciones protegidas
│   └── useUpdateFilterUrl.jsx # Hook para actualizar filtros en URL
│
├── components/                # 🧩 Componentes compartidos/UI
│   ├── ui/                   # Componentes de UI reutilizables
│   │   ├── IconButton.jsx
│   │   ├── CustomSelect.jsx
│   │   ├── Icon.jsx
│   │   ├── Loading.jsx
│   │   ├── FetchError.jsx
│   │   ├── NoResults.jsx
│   │   ├── SkeletonLoader.jsx
│   │   ├── ContinueReadingButton.jsx
│   │   └── ModalConfirmacion.jsx
│   │
│   ├── Navigation/           # Componentes de navegación
│   │   └── BooksBreadcrumbs.jsx
│   │
│   ├── Sidebar/              # Componentes del sidebar
│   │   ├── Sidebar.jsx
│   │   ├── SidebarFooter.jsx
│   │   └── SidebarHeader.jsx
│   │
│   ├── Layout.jsx            # Layout principal
│   ├── ContainerApp.jsx      # Container de la app
│   ├── ErrorBoundary.jsx     # Manejo de errores
│   ├── RouteError.jsx        # Errores de rutas
│   └── Editor.jsx            # Editor genérico
│
├── store/                     # 🗄️ Zustand Stores
│   ├── AiStore.jsx
│   ├── AuthStore.jsx
│   ├── BooksStore.jsx
│   ├── FavoritesStore.jsx
│   ├── NavigationStore.jsx
│   ├── NotesStore.jsx
│   ├── RecentlyReadStore.jsx
│   ├── TrackingBookStore.jsx
│   ├── TrackingStore.jsx
│   ├── UIStore.jsx
│   └── VersesNotesStore.jsx
│
├── utils/                     # 🛠️ Utilidades
│   ├── CreateQuill.js
│   ├── DeleteNotesData.js
│   ├── FilterByCategory.js
│   ├── FilterByProgress.js
│   ├── FilterBySearch.js
│   ├── FilterByTestament.js
│   ├── FormatTime.js
│   ├── GetData.js
│   ├── GetGreeting.js
│   ├── GetRandomNumber.js
│   ├── LoadNotesData.js
│   ├── LocalStorageData.js
│   ├── SaveNotesData.js
│   ├── ScrollToTop.js
│   ├── TranslationOptions.js
│   ├── UpdateNotesData.js
│   ├── VerseUrl.js
│   ├── bookCategories.js
│   ├── calculateStreak.js
│   ├── cleanVerseContent.js
│   ├── getVerseData.js
│   ├── textUtils.js
│   └── useReadTime.js
│
├── styles/                    # 🎨 CSS Modules
│   └── [todos los archivos .module.css]
│
├── supabase/                  # 🔐 Configuración de Supabase
│   └── supabaseClient.js
│
└── assets/                    # 🖼️ Assets (imágenes, logos, etc.)
    └── LogoApp.jsx
```

## 📋 Principios de Organización

### 1. **Pages** (`/pages`)
- Componentes que representan rutas completas
- Cada archivo corresponde a una ruta en el router
- Solo orquestan features y componentes, no lógica compleja

### 2. **Features** (`/features`)
- Agrupados por funcionalidad/dominio
- Cada carpeta es una característica completa
- Contiene componentes específicos de esa feature

### 3. **Hooks** (`/hooks`)
- Todos los custom hooks en un solo lugar
- Fácil de encontrar y reutilizar
- Nombres descriptivos con prefijo `use`

### 4. **Components** (`/components`)
- Componentes compartidos y reutilizables
- UI components genéricos
- Layout y estructura

### 5. **Store** (`/store`)
- Todos los Zustand stores
- Un archivo por dominio de datos

### 6. **Utils** (`/utils`)
- Funciones utilitarias puras
- Helpers y transformadores de datos

## 🔄 Cambios Realizados

### Movimientos de Archivos

**Hooks:**
- ✅ `components/Hooks/*` → `hooks/*`

**Páginas:**
- ✅ `components/Home.jsx` → `pages/Home.jsx`
- ✅ `components/Read.jsx` → `pages/Read.jsx`
- ✅ `components/Notes.jsx` → `pages/Notes.jsx`
- ✅ `components/Favorites.jsx` → `pages/Favorites.jsx`
- ✅ `components/AI.jsx` → `pages/AI.jsx`
- ✅ `components/Login.jsx` → `pages/Login.jsx`

**Features - Books:**
- ✅ `components/BookCard.jsx` → `features/books/BookCard.jsx`
- ✅ `components/BookGrid.jsx` → `features/books/BookGrid.jsx`
- ✅ `components/BookProgress.jsx` → `features/books/BookProgress.jsx`
- ✅ `components/Read/*` → `features/books/*`

**Features - Chapters:**
- ✅ `components/ChapterContent.jsx` → `features/chapters/ChapterContent.jsx`
- ✅ `components/ChapterGrid.jsx` → `features/chapters/ChapterGrid.jsx`
- ✅ `components/ChapterNavigation.jsx` → `features/chapters/ChapterNavigation.jsx`

**Features - Home:**
- ✅ `components/Home/*` → `features/home/*`

**Features - Notes:**
- ✅ `components/Notes/*` → `features/notes/*`

**Features - Favorites:**
- ✅ `components/FavoriteVerses.jsx` → `features/favorites/FavoriteVerses.jsx`

### Imports Actualizados

Todos los imports fueron actualizados automáticamente para reflejar la nueva estructura:

**Ejemplo de cambios:**
```javascript
// Antes
import { useChapterData } from './Hooks/useChapterData';
import BookGrid from './BookGrid';

// Después
import { useChapterData } from '../../hooks/useChapterData';
import BookGrid from '../features/books/BookGrid';
```

## ✅ Beneficios

1. **Mejor organización**: Archivos agrupados por función, no por tipo
2. **Fácil navegación**: Estructura clara y predecible
3. **Escalabilidad**: Fácil agregar nuevas features
4. **Mantenibilidad**: Código relacionado está junto
5. **Imports más claros**: Rutas más descriptivas

## 🎯 Convenciones

- **Pages**: Componentes de ruta, orquestan features
- **Features**: Lógica de negocio específica
- **Components**: UI reutilizable
- **Hooks**: Lógica reutilizable
- **Utils**: Funciones puras
- **Store**: Estado global

## 📝 Notas

- Solo `App.jsx` y `main.jsx` permanecen en la raíz de `src/`
- Todos los imports fueron actualizados automáticamente
- La estructura sigue principios de Domain-Driven Design
- Fácil de entender para nuevos desarrolladores
