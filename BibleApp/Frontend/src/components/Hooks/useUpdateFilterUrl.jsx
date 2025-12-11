// useUpdateFilterUrl.jsx
import { useNavigate } from "react-router-dom";
import { useCallback } from "react";

function useUpdateFilterUrl() {
    const navigate = useNavigate();
    
    // Función para actualizar un filtro específico
    const updateFilter = useCallback((key, value, navigateTo = true) => {
        const searchParams = new URLSearchParams(window.location.search);
        
        if (value) {
            searchParams.set(key, value); 
        } else {
            searchParams.delete(key); 
        }
        
        const newUrl = `/books?${searchParams.toString()}`;
        localStorage.setItem('lastBooksFilters', searchParams.toString());
        if (navigateTo) {
            navigate(newUrl);
        }
    }, [navigate]);

    // Función para navegar manteniendo TODOS los filtros actuales
    const navigateWithCurrentFilters = useCallback((newPath = '/books') => {
        // Obtener todos los parámetros actuales
        const currentParams = localStorage.getItem('lastBooksFilters');
        // Si hay parámetros, agregarlos
        if (currentParams) {
            navigate(`${newPath}?${currentParams.toString()}`);
        } else {
            navigate(newPath);
        }
    }, [navigate]);

    return { updateFilter, navigateWithCurrentFilters };
}

export default useUpdateFilterUrl;