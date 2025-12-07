// useUpdateFilterUrl.jsx
import { useNavigate } from "react-router-dom";
import { useCallback } from "react";

function useUpdateFilterUrl() {
    const navigate = useNavigate();
        
    // Usar useCallback para que la función sea estable
    const updateFilter = useCallback((key, value, reset = false) => {
        const searchParams = new URLSearchParams(window.location.search);
        
        if (value) {
            searchParams.set(key, value); 
        } else {
            searchParams.delete(key); 
        }
        
        const newUrl = `/books?${searchParams.toString()}`;
        
        // Guardar en localStorage
        localStorage.setItem('lastBooksFilters', searchParams.toString());
        
        navigate(newUrl);
    }, [navigate]); // Solo depende de navigate

    return updateFilter;
}

export default useUpdateFilterUrl;