import Loading from "./ui/Loading";
import FetchError from "./ui/FetchError";
import { useMemo } from "react";

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
                <div>
                    <h3>Book Progress</h3>
                    <p>Chapter Completed {chapterCompletedCount}/{chapterNumber}</p>
                    <div>
                        <progress value={percentage} max="100"></progress>
                        <p>{percentage.toFixed(1)}%</p>
                    </div>
                    {percentage === 100 && 
                        <p>✅ Completed</p>
                    }
                </div>
            )}
        </div>
    );
}

export default BookProgress;
