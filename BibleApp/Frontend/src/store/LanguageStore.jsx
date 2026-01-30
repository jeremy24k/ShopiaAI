import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const useLanguageStore = create(
  persist(
    (set) => ({
      // Estado
      language: 'es', // idioma por defecto: español
      
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
