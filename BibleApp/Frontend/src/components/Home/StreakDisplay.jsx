import { useEffect } from "react";
import { useTrackingStore } from "../../store/TrackingStore";
import { Link } from "react-router-dom";
import styles from "../../styles/StreakDisplay.module.css"
import Icon from "../../components/ui/Icon";
import { Flame } from "lucide-react"

function StreakDisplay() {
    // Subscribe to store state
    const Streak = useTrackingStore(state => state.Streak);
    const TrackingLoading = useTrackingStore(state => state.TrackingLoading);

    const formatStreak = (streak) => {
        if (streak <= 0) {
            return (
                <div className={styles.blank_streak}>
                    <p>
                        30 min diarios para tu racha.
                        <Link to="/books">Empieza Ahora</Link>
                    </p>
                </div>
            )
        } else if (streak === 1) {
            return (
                <p className={styles.achievement_message}>
                    ¡Buen comienzo, Sigue asi!
                </p>
            )
        } else if (streak > 1) {
            return (
                 <p className={styles.achievement_message}>
                    ¡Manten Tu racha al dia!
                </p>
            )
        }
    }

    return (
        <div className={styles.ctn_streak}>
            <div className={styles.tlt_streak}>
                <Icon icon={<Flame />} size="small" color="primary" />
                <h2>
                    Current Streak
                </h2>
            </div>
            {TrackingLoading ? (
                <p>Loading...</p>
            ) : (
                <div className={styles.streak}>
                    <p className={styles.streak_count}>{Streak}</p>
                    {formatStreak(Streak)}
                </div>
                )
            }
          
        </div>
    );
}

export default StreakDisplay;