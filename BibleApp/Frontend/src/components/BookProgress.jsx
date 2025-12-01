import Loading from "./ui/Loading";
import FetchError from "./ui/FetchError";
import { useMemo } from "react";
import Icon from "../components/ui/Icon";
import { CircleCheckBig } from "lucide-react";
import styles from "../styles/BookProgress.module.css"

function BookProgress({chapterNumber, chapterCompleted, CompleteLoading, CompleteError, bookId, translationValue}) {

    const chapterCompletedCount = useMemo(() => {
        if (!bookId || !translationValue) return 0;
        
        const filtered = chapterCompleted.filter(item => {
            const bookData = item.book_data;
            return bookData.bookId === bookId.toUpperCase() && 
                   bookData.translationValue === translationValue;
        });
        
        return filtered.length;
    }, [chapterCompleted, bookId, translationValue]);

    const percentage = (chapterCompletedCount / chapterNumber) * 100;

    return (
        <div>
            {CompleteLoading ? (
                <Loading />
            ) : CompleteError ? (
                <FetchError />
            ) : (
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
            )}
        </div>
    );
}

export default BookProgress;
