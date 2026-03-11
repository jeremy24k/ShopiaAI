import styles from "../styles/RouteError.module.css";
import { Link } from "react-router-dom";
import { BookOpen, Home, AlertCircle } from "lucide-react";
import { useTranslation } from "../hooks/useTranslation";

function RouteError() {
    const { t } = useTranslation();

    return (
        <div className={styles.notFound}>
            <div className={styles.content}>
                <BookOpen size={48} color="var(--primary-color)" strokeWidth={1.5} />
                <h1>404</h1>
                <p>{t('not_found_title')}</p>
                <span className={styles.subtitle}>{t('not_found_message')}</span>
                <Link to="/">
                    <Home size={16} />
                    {t('go_home')}
                </Link>
            </div>
        </div>
    );
}

export default RouteError;
