import getGreeting from "../../utils/GetGreeting";
import styles from "../../styles/greetings.module.css";
import { useTranslation } from "../../hooks/useTranslation";
import { useAuthStore } from "../../store/AuthStore";

function GreetingComponent() {
    const { t } = useTranslation();
    const user = useAuthStore(state => state.user);
    const loading = useAuthStore(state => state.loading);
    const greetingKey = getGreeting();

    function getDisplayName(email) {
        if (!email) return;

        const username = email.split('@')[0];

        return username
            .replace(/[._-]/g, ' ')
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    return (
        <header className={styles.greeting_container} role="banner" aria-label={t('aria_welcome_section')}>
            <h1 className={styles.greeting}>
                {t(greetingKey)}{' '}
                {loading ? (
                    <span aria-live="polite" aria-busy="true">
                        {t('loading')}
                    </span>
                ) : (
                    <span aria-label={t('aria_user_name')}>
                        {getDisplayName(user?.email) || t('guest')}
                    </span>
                )}
            </h1>
            <p className={styles.greeting_message} aria-label={t('aria_app_description')}>
                {t('greeting_message')}
            </p>
        </header>
    );
}

export default GreetingComponent;