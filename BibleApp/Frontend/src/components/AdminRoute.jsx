import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/AuthStore";
import styles from './AdminRoute.module.css';

function AdminRoute({ children }) {
    const user = useAuthStore(state => state.user);
    const loading = useAuthStore(state => state.loading);
    const location = useLocation();

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
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
            <div className={styles.accessDeniedContainer}>
                <h1 className={styles.accessDeniedTitle}>🔒</h1>
                <h2 className={styles.accessDeniedSubtitle}>Acceso Denegado</h2>
                <p className={styles.accessDeniedMessage}>No tienes permisos para acceder a esta página.</p>
                <button 
                    onClick={() => window.history.back()}
                    className={styles.backButton}
                >
                    Volver
                </button>
            </div>
        );
    }

    return children;
}

export default AdminRoute;
