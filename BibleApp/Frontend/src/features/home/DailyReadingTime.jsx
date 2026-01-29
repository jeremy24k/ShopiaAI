import { useEffect } from "react";
import { useTrackingStore } from "../../store/TrackingStore";
import { useAuthStore } from '../../store/AuthStore';
import { useTranslation } from "../../hooks/useTranslation";
import styles from "../../styles/DailyReadingTime.module.css";
import { Link } from "react-router-dom"
import Icon from "../../components/ui/Icon";
import { Clock4 } from "lucide-react"
import SkeletonLoader from "../../components/ui/SkeletonLoader";
import NumberLoader from "../../components/ui/NumberLoader";

function DailyReadingTime() {
    const { t } = useTranslation();
    
    // Subscribe to store state
    const Minutes = useTrackingStore(state => state.Minutes);
    const TrackingLoading = useTrackingStore(state => state.TrackingLoading);
    const user = useAuthStore(state => state.user);

    // Cargar datos de tracking solo una vez cuando el usuario está autenticado
    useEffect(() => {
        if (user && !TrackingLoading) {
            console.log("🏠 Loading tracking data in home...");
            useTrackingStore.getState().InitTracking();
        }
    }, [user]); // ← Solo depende de user

    const formatTime = (minutes) => {
        if (minutes < 30) {
            return (
                <>
                    <p aria-label={`${minutes} ${t('minutes') || 'minutes'}`}>
                        {minutes}<span>m</span>
                    </p>
                    <p>
                        {t('daily_goal_message')}
                        <Link to="/books" aria-label={t('start_now')}>{t('start_now')}</Link>
                    </p>
                </>
            );
        } else if (minutes > 60) {
            const hours = Math.floor(minutes / 60);
            const mins = minutes % 60;
            return (
                <>
                    <p aria-label={`${hours} ${t('hours') || 'hours'} ${mins} ${t('minutes') || 'minutes'}`}>
                        {hours} <span>h</span> {mins}
                        <span>m</span>
                    </p>
                    <p className={styles.achievement_message} role="status">
                        {t('daily_goal_reached')}
                    </p>
                </>
            );
        } else {
            return (
                <>
                    <p aria-label={`${minutes} ${t('minutes') || 'minutes'}`}>
                        {minutes}<span>m</span>
                    </p>
                    <p className={styles.achievement_message} role="status">
                        {t('daily_goal_completed')}
                    </p>
                </>
            );
        }
    };

    useEffect(() => {
        console.log("🏠 DailyReadingTime Debug:");
        console.log("  - Minutes:", Minutes);
        console.log("  - TrackingLoading:", TrackingLoading);
        console.log("  - User:", user ? "✅" : "❌");
        console.log("  - Should show loading:", TrackingLoading);
    }, [Minutes, TrackingLoading, user]);

    return (
        <div className={styles.ctn_daily_reading_time} aria-label={t('aria_reading_time_section')}>
            <header className={styles.title}>
                <Icon icon={<Clock4 />} size="small" color="primary" aria-hidden="true" />
                <h2>
                    {t('reading_time')}
                </h2>
            </header>
            <div className={styles.ctn_time}>
                {TrackingLoading ? (
                    <>
                        <p aria-live="polite" aria-busy="true">
                            <NumberLoader />
                        </p>
                        <SkeletonLoader 
                            variant="text" 
                            width="100%" 
                            height="32px"
                        />
                    </>
                ) : (
                    formatTime(Minutes)
                )}
            </div>
        </div>
    );
}

export default DailyReadingTime;