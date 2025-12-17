import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useBooksStore } from '../store/BooksStore';

/**
 * Hook centralizado para sincronizar URL ↔ Store ↔ localStorage
 * 
 * RESPONSABILIDADES:
 * - Escucha cambios en URL params (?translation=xxx)
 * - Actualiza el store cuando la URL cambia
 * - Sincroniza localStorage automáticamente con la URL
 * - NO actualiza la URL (eso lo hacen los componentes)
 * 
 * USAR SOLO UNA VEZ en el nivel más alto (App.jsx o AppWrapper)
 */
export function useUrlSync() {
  const [searchParams] = useSearchParams();
  const translations = useBooksStore(state => state.translations);
  const selectedTranslation = useBooksStore(state => state.selectedTranslation);
  const setSelectedTranslation = useBooksStore(state => state.setSelectedTranslation);

  useEffect(() => {
    // Esperar a que las traducciones estén cargadas
    if (translations.length === 0) return;

    const urlTranslation = searchParams.get('translation');
    
    // Si hay traducción en URL y es diferente a la actual
    if (urlTranslation && urlTranslation !== selectedTranslation.value) {
      const translationObj = translations.find(t => t.id === urlTranslation);
      
      if (translationObj) {
        // Update store with complete object
        setSelectedTranslation({
          value: translationObj.id,
          label: translationObj.name,
          shortName: translationObj.shortName
        });

        // Sync localStorage with URL params
        const saved = localStorage.getItem('lastBooksFilters') || '';
        const savedParams = new URLSearchParams(saved);
        savedParams.set('translation', translationObj.id);
        localStorage.setItem('lastBooksFilters', savedParams.toString());
      }
    }
  }, [searchParams, translations, selectedTranslation.value, setSelectedTranslation]);
}
