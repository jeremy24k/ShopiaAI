import { useMemo } from "react";
import Icon from "../../components/ui/Icon";
import { CircleCheckBig } from "lucide-react";
import styles from "../../styles/BookProgress.module.css"
import { useTrackingBookStore } from "../../store/TrackingBookStore";

function BookProgress({ bookId, translationValue, fontSize, iconSize }) {

    if (!bookId || !translationValue) {
        return null;
    }
    
    const { getBookProgress } = useTrackingBookStore.getState();
    const percentage = getBookProgress(bookId.toUpperCase(), translationValue).percentage || 0;

    const fontSizeClass = styles[`font_size_${fontSize}`];
    
    return (
        <div className={`${styles.ctn_progress} ${fontSizeClass}`}>
            {percentage === 100 ? (
                <div className={styles.completed}>
                    <p>Book Completed</p>
                    <Icon icon={<CircleCheckBig />} size={iconSize ? iconSize : "tiny"} color="green" />
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
