import { Link } from "react-router-dom";
import { useAuthStore } from "../store/AuthStore";
import { useTranslation } from "../hooks/useTranslation";
import styles from "../styles/RequireAuth.module.css";
import Icon from "../components/ui/Icon";
import LinkButton from "../components/ui/LinkButton";
import { LogIn } from "lucide-react";

function RequireAuth({ 
    children, 
    fallbackMessage,
    showLoginButton = true,
    customFallback = null,
    compact = false
}) {
    const { t } = useTranslation();
    const user = useAuthStore(state => state.user);
    const loading = useAuthStore(state => state.loading);

    if (loading) {
        return (
            <div className={compact ? styles.loading_compact : styles.loading_container}>
                <p>{t("loading")}...</p>
            </div>
        );
    }

    if (!user) {
        if (customFallback) {
            return customFallback;
        }

        if (compact) {
            return (
                <div className={styles.auth_compact}>
                    <p>{fallbackMessage || t("login_register_progress")}</p>
                    {showLoginButton && (
                        <LinkButton to="/login" variant="primary" size="normal">
                            {t('login')}
                            <Icon icon={<LogIn />} size="tiny"/>
                        </LinkButton>
                    )}
                </div>
            );
        }

        return (
            <div className={styles.auth_required}>
                <p>{fallbackMessage || t("login_register_progress")}</p>
                {showLoginButton && (
                    <LinkButton to="/login" variant="primary" size="normal">
                            {t('login')}
                            <Icon icon={<LogIn />} size="tiny"/>
                    </LinkButton>
                )}
            </div>
        );
    }

    return children;
}

export default RequireAuth;
