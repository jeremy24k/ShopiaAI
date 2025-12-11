import { create } from 'zustand';

/**
 * Store global para rastrear el historial de navegación interno
 * Comparte el historial entre todos los componentes
 */
export const useNavigationStore = create((set, get) => ({
    history: [],
    currentIndex: -1,

    // Agregar una nueva ruta al historial
    addToHistory: (path) => {
        const { history, currentIndex } = get();
        
        // Si la ruta es diferente a la actual
        if (history.length === 0 || history[currentIndex] !== path) {
            // Si estamos en medio del historial (retrocedimos), eliminar el futuro
            let newHistory = [...history];
            let newIndex = currentIndex;
            
            if (currentIndex < history.length - 1) {
                newHistory = newHistory.slice(0, currentIndex + 1);
            }
            
            // Agregar nueva ruta
            newHistory.push(path);
            newIndex = newHistory.length - 1;
            
            // Limitar el historial a 50 entradas
            if (newHistory.length > 50) {
                newHistory = newHistory.slice(-50);
                newIndex = newHistory.length - 1;
            }
            
            set({ 
                history: newHistory, 
                currentIndex: newIndex 
            });
        }
    },

    // Obtener información del historial
    getHistoryInfo: () => {
        const { history, currentIndex } = get();
        return {
            history: [...history],
            currentIndex,
            canGoBack: currentIndex > 0,
            canGoForward: currentIndex < history.length - 1,
            previousPath: currentIndex > 0 ? history[currentIndex - 1] : null,
            nextPath: currentIndex < history.length - 1 ? history[currentIndex + 1] : null,
            currentPath: history[currentIndex] || ''
        };
    },

    // Resetear el historial (útil para testing o logout)
    resetHistory: () => {
        set({ history: [], currentIndex: -1 });
    }
}));

