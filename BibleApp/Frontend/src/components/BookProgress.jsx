import { useMemo } from "react";
import Icon from "../components/ui/Icon";
import { CircleCheckBig } from "lucide-react";
import styles from "../styles/BookProgress.module.css"
import { useTrackingBookStore } from "../store/TrackingBookStore";

function BookProgress({ bookId, translationValue }) {
    // ⭐ Suscribirse a bookProgress para reaccionar cuando cambie
    const bookProgress = useTrackingBookStore(state => state.bookProgress);

    // Obtener el progreso pre-calculado del store
    const progress = useMemo(() => {
        if (!bookId || !translationValue) {
            return {
                completedChapters: 0,
                totalChapters: 0,
                percentage: 0,
                status: 'not_started'
            };
        }
        
        const { getBookProgress } = useTrackingBookStore.getState();
        return getBookProgress(bookId.toUpperCase(), translationValue);
    }, [bookProgress, bookId, translationValue]);

    const percentage = progress.percentage || 0;

    return (
        <div className={styles.ctn_progress}>
            {percentage === 100 ? (
                <div className={styles.completed}>
                    <p>Book Completed</p>
                    <Icon icon={<CircleCheckBig />} size="tiny" color="green" />
                </div>
            ) : (
                <div className={styles.progress_text}>
                    <p>Progress</p>
                    <p>{percentage.toFixed(0)}%</p>
                </div>
            )}

            <div className={styles.progress}>
                <div className={`${styles.progress_bar} ${percentage === 100 ? styles.completed_bar : ''}`}>
                    <progress value={percentage} max="100"></progress>
                </div>
            </div>
        </div>
    );
}

export default BookProgress;
