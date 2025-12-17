import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/AuthStore';

function useProtectedAction() {
    const { user, loading, isAuthenticated } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();

    const protectedAction = (action, actionName = "esta acción") => {
        return async (...args) => {
            // Si está cargando, no hacer nada
            if (loading) {
                console.log('⏳ Verificando autenticación...');
                return;
            }

            // Si no está autenticado, redirigir a login
            if (!isAuthenticated) {
                console.log(`🔒 Login requerido para: ${actionName}`);
                
                navigate('/login', {
                    state: {
                        from: location,
                        action: actionName,
                        message: `Inicia sesión para ${actionName.toLowerCase()}`
                    },
                    replace: false
                });
                return;
            }

            // Si está autenticado, ejecutar la acción
            try {
                return await action(...args);
            } catch (error) {
                console.error(`Error en ${actionName}:`, error);
                throw error;
            }
        };
    };

    return {
        protectedAction,
        isAuthenticated,
        loading
    };
}

export default useProtectedAction;