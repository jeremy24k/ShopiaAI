import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/AuthStore";

function AdminRoute({ children }) {
    const user = useAuthStore(state => state.user);
    const loading = useAuthStore(state => state.loading);
    const location = useLocation();

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100dvh',
                fontSize: '1.2rem',
                color: '#6b7280'
            }}>
                Verificando permisos...
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    const isAdmin = user.user_metadata?.is_admin === true;

    if (!isAdmin) {
        return (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100dvh',
                gap: '1rem'
            }}>
                <h1 style={{ fontSize: '3rem' }}>🔒</h1>
                <h2 style={{ fontSize: '1.5rem', color: '#ef4444' }}>Acceso Denegado</h2>
                <p style={{ color: '#6b7280' }}>No tienes permisos para acceder a esta página.</p>
                <button 
                    onClick={() => window.history.back()}
                    style={{
                        marginTop: '1rem',
                        padding: '0.75rem 1.5rem',
                        background: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '1rem'
                    }}
                >
                    Volver
                </button>
            </div>
        );
    }

    return children;
}

export default AdminRoute;
