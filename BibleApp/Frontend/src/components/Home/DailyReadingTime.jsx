import { useEffect } from "react";
import { useTrackingStore } from "../../store/TrackingStore";
import styles from "../../styles/DailyReadingTime.module.css";
import { Link } from "react-router-dom"
import Icon from "../../components/ui/Icon";
import { Clock4 } from "lucide-react"
import SkeletonLoader from "../ui/SkeletonLoader";
import NumberLoader from "../ui/NumberLoader";

function DailyReadingTime() {
    // Subscribe to store state
    const Minutes = useTrackingStore(state => state.Minutes);
    const TrackingLoading = useTrackingStore(state => state.TrackingLoading);

    const formatTime = (minutes) => {
        if (minutes < 30) {
            return (
                <>
                    <p>
                        {minutes}<span>m</span>
                    </p>
                    <p>
                        30 min diarios para tu racha.
                        <Link to="/books">Empieza Ahora</Link>
                    </p>
                </>
            );
        } else if (minutes > 60) {
            const hours = Math.floor(minutes / 60);
            const mins = minutes % 60;
            return (
                <>
                    <p>
                        {hours} <span>h</span> {mins}
                        <span>m</span>
                    </p>
                    <p className={styles.achievement_message}>
                        ¡Has alcanzado tu tiempo de lectura diario!
                    </p>
                </>
            );
        } else {
            return (
                <>
                    <p>
                        {minutes}<span>m</span>
                    </p>
                    <p className={styles.achievement_message}>
                        ¡Has cumplido tu jornada de hoy!
                    </p>
                </>
            );
        }
    };

    useEffect(() => {
        console.log('hola');
    },[])

    return (
        <div className={styles.ctn_daily_reading_time}>

            <div className={styles.title}>
                <Icon icon={<Clock4 />} size="small" color="primary" />
                <h2>
                    Reading Time
                </h2>
            </div>
            <div className={styles.ctn_time}>
                {TrackingLoading ? (
                    <>
                        <p>
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