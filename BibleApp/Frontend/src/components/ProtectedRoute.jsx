import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/AuthStore";
import styles from './ProtectedRoute.module.css';

function ProtectedRoute({ children }) {
    const user = useAuthStore(state => state.user);
    const loading = useAuthStore(state => state.loading);
    const location = useLocation();

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                Loading...
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
}

export default ProtectedRoute;
