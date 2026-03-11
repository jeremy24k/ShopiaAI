import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Detect language from browser on first visit (before any stored preference)
function detectInitialLanguage() {
  const browserLang = navigator.language || navigator.languages?.[0] || 'es';
  // Spanish locales: es, es-ES, es-MX, es-AR, es-CO, etc.
  return browserLang.startsWith('es') ? 'es' : 'en';
}

export const useLanguageStore = create(
  persist(
    (set) => ({
      // Estado — detectado del navegador en primer acceso, luego persistido
      language: detectInitialLanguage(),
      
      // Acciones
      setLanguage: (language) => set({ language }),
      
      // Toggle entre español e inglés
      toggleLanguage: () => set((state) => ({
        language: state.language === 'es' ? 'en' : 'es'
      })),

    }),
    {
      name: 'language-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
