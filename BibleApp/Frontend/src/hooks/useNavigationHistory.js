import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useNavigationStore } from '../../store/NavigationStore';

/**
 * Hook para rastrear el historial de navegación interno de la aplicación
 * Usa un store global para compartir el historial entre componentes
 */
function useNavigationHistory() {
    const location = useLocation();
    const addToHistory = useNavigationStore(state => state.addToHistory);
    const getHistoryInfo = useNavigationStore(state => state.getHistoryInfo);

    // Actualizar el historial cuando cambia la ruta
    useEffect(() => {
        const currentPath = location.pathname + location.search;
        addToHistory(currentPath);
    }, [location.pathname, location.search, addToHistory]);

    // Retornar información del historial
    return getHistoryInfo();
}

export default useNavigationHistory;

