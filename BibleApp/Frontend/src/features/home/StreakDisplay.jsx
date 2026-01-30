import { useEffect } from "react";
import { useTrackingStore } from "../../store/TrackingStore";
import { useAuthStore } from '../../store/AuthStore';
import { useTranslation } from "../../hooks/useTranslation";
import { Link } from "react-router-dom";
import styles from "../../styles/StreakDisplay.module.css"
import Icon from "../../components/ui/Icon";
import { Flame } from "lucide-react"
import SkeletonLoader from "../../components/ui/SkeletonLoader";
import NumberLoader from "../../components/ui/NumberLoader";

function StreakDisplay() {
    const { t } = useTranslation();
    
    // Subscribe to store state
    const Streak = useTrackingStore(state => state.Streak);
    const TrackingLoading = useTrackingStore(state => state.TrackingLoading);


    const formatStreak = (streak) => {
        if (streak <= 0) {
            return (
                <div className={styles.blank_streak}>
                    <p>
                        {t('daily_goal_message')}
                        <Link to="/books" aria-label={t('start_now')}>{t('start_now')}</Link>
                    </p>
                </div>
            )
        } else if (streak === 1) {
            return (
                <p className={styles.achievement_message} role="status">
                    {t('streak_start_message')}
                </p>
            )
        } else if (streak > 1) {
            return (
                <p className={styles.achievement_message} role="status">
                    {t('streak_maintain_message')}
                </p>
            )
        }
    }

    return (
        <div className={styles.ctn_streak} aria-label={t('aria_streak_section')}>
            <header className={styles.tlt_streak}>
                <Icon icon={<Flame />} size="small" color="primary" aria-hidden="true" />
                <h2>
                    {t('current_streak')}
                </h2>
            </header>
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
                <div className={styles.streak}>
                    <p className={styles.streak_count} aria-label={t('aria_streak_count')}>{Streak}</p>
                    {formatStreak(Streak)}
                </div>
                )
            }
          
        </div>
    );
}

export default StreakDisplay;