# Arquitectura de Sincronización de Traducción

## 🎯 Principio de Diseño

**"La URL es la fuente de verdad, el Store es un cache reactivo"**

## 📐 Flujo de Datos

```
┌─────────────────────────────────────────────────────┐
│ URL (?translation=xxx)                              │
│ ↓ ÚNICA FUENTE DE VERDAD                            │
└─────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────┐
│ useUrlSync (App.jsx)                                │
│ ↓ ÚNICO PUNTO DE SINCRONIZACIÓN URL → Store        │
└─────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────┐
│ BooksStore.selectedTranslation                      │
│ ↓ CACHE REACTIVO                                    │
└─────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────┐
│ Componentes (solo leen del store)                  │
│ - ChapterContent.jsx                                │
│ - Filter.jsx                                        │
│ - useChapterData.jsx                                │
└─────────────────────────────────────────────────────┘
```

## 🔧 Componentes Clave

### 1. **useUrlSync.js** (Hook Centralizado)
**Ubicación**: `/src/hooks/useUrlSync.js`

**Responsabilidad**: 
- Escucha cambios en URL params (?translation=xxx)
- Actualiza el store cuando la URL cambia
- **NO actualiza la URL** (eso lo hacen los componentes)

**Uso**: Solo en `AppWrapper` (App.jsx) - **UN SOLO LUGAR**

```javascript
// App.jsx
function AppWrapper() {
  useUrlSync(); // ✅ Único punto de sincronización
  // ...
}
```

### 2. **Componentes que Cambian Traducción**

**Responsabilidad**: Solo actualizar la URL

```javascript
// ChapterContent.jsx, Filter.jsx, etc.
const handleTranslationChange = (newTranslation) => {
  // 1) Actualizar URL
  const params = new URLSearchParams(searchParams);
  params.set("translation", newTranslation.value);
  setSearchParams(params, { replace: true });

  // 2) Persistir en localStorage
  localStorage.setItem('lastTranslation', newTranslation.value);
  
  // ✅ NO llamar setSelectedTranslation
  // ✅ NO llamar clearChapterData
  // useUrlSync se encarga automáticamente
};
```

### 3. **useChapterData.jsx**

**Responsabilidad**: Solo cargar capítulos según traducción actual del store

```javascript
useEffect(() => {
  // Usar traducción del store (ya sincronizada por useUrlSync)
  const translationToUse = selectedTranslation.value;
  await fetchChapter(bookId, chapterNumber, translationToUse);
}, [bookId, chapterNumber, selectedTranslation.value]);
```

## ✅ Ventajas de esta Arquitectura

1. **Un solo punto de sincronización**: No hay duplicación ni conflictos
2. **Flujo unidireccional**: URL → useUrlSync → Store → Componentes
3. **Fácil de debuggear**: Solo un lugar donde buscar problemas
4. **Sin seteos múltiples**: Solo 1 actualización del store por cambio
5. **Código más simple**: Los componentes no manejan sincronización

## ❌ Qué NO Hacer

```javascript
// ❌ NO sincronizar en múltiples lugares
useEffect(() => {
  const urlTranslation = searchParams.get('translation');
  if (urlTranslation) {
    setSelectedTranslation(...); // ❌ Duplica useUrlSync
  }
}, [searchParams]);

// ❌ NO actualizar store manualmente en componentes
const handleChange = (newTranslation) => {
  setSelectedTranslation(newTranslation); // ❌ useUrlSync lo hace
  setSearchParams(...);
};

// ❌ NO limpiar datos manualmente
const handleChange = (newTranslation) => {
  setSearchParams(...);
  clearChapterData(); // ❌ useChapterData lo detecta automáticamente
};
```

## 🎯 Reglas de Oro

1. **useUrlSync es el ÚNICO que sincroniza URL → Store**
2. **Componentes solo actualizan la URL**
3. **El store se actualiza automáticamente**
4. **useChapterData detecta cambios y recarga**

## 🔍 Debugging

Si hay problemas de sincronización:

1. Verificar que `useUrlSync` está en `AppWrapper`
2. Verificar que NO hay otros `setSelectedTranslation` en componentes
3. Verificar que la URL se actualiza correctamente
4. Verificar console.log en `ChapterContent.jsx` línea 135

## 📝 Archivos Modificados

- ✅ `/src/hooks/useUrlSync.js` - Creado
- ✅ `/src/App.jsx` - Integrado useUrlSync
- ✅ `/src/components/Read.jsx` - Eliminada sincronización de traducción
- ✅ `/src/components/Hooks/useChapterData.jsx` - Eliminada sincronización
- ✅ `/src/components/ChapterContent.jsx` - Simplificado handleTranslationChange
