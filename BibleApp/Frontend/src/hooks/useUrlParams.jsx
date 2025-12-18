import { useNavigate, useSearchParams } from "react-router-dom";
import { useCallback } from "react";

function useUrlParams() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    
    const updateUrlParam = useCallback((key, value, options = {}) => {
        const { 
            basePath = '/books',
            replace = true,
            deleteIfEmpty = true 
        } = options;
        
        const params = new URLSearchParams(searchParams);
        
        if (value && (!deleteIfEmpty || value !== 'all')) {
            params.set(key, value);
        } else {
            params.delete(key);
        }
        
        const url = params.toString() ? `${basePath}?${params.toString()}` : basePath;
        navigate(url, { replace });
    }, [navigate, searchParams]);
    
    const updateMultipleParams = useCallback((updates, options = {}) => {
        const { 
            basePath = '/books',
            replace = true 
        } = options;
        
        const params = new URLSearchParams(searchParams);
        
        Object.entries(updates).forEach(([key, value]) => {
            if (value && value !== 'all') {
                params.set(key, value);
            } else {
                params.delete(key);
            }
        });
        
        const url = params.toString() ? `${basePath}?${params.toString()}` : basePath;
        navigate(url, { replace });
    }, [navigate, searchParams]);
    
    const clearAllParams = useCallback((basePath = '/books') => {
        navigate(basePath, { replace: true });
    }, [navigate]);
    
    return { 
        updateUrlParam, 
        updateMultipleParams, 
        clearAllParams,
        searchParams 
    };
}

export default useUrlParams;
