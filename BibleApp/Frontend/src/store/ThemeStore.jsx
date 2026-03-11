import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
}

export const useThemeStore = create(
  persist(
    (set, get) => ({
      theme: 'light',

      setTheme: (theme) => {
        applyTheme(theme);
        set({ theme });
      },

      toggleTheme: () => {
        const next = get().theme === 'light' ? 'dark' : 'light';
        applyTheme(next);
        set({ theme: next });
      },

      // Call on app init to re-apply persisted theme
      initTheme: () => {
        applyTheme(get().theme);
      },
    }),
    {
      name: 'theme-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
