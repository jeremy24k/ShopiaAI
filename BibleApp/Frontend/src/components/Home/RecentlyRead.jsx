import { Link } from "react-router-dom";
import { useRecentlyReadStore } from "../../store/RecentlyReadStore";
import { useAuthStore } from "../../store/AuthStore";
import { useEffect } from "react";
import { formatRelativeTime } from "../../utils/FormatTime";
import { useTrackingBookStore } from "../../store/TrackingBookStore";
import BookProgress from "../../components/BookProgress";
import Icon from "../../components/ui/Icon";
import { BookOpen } from "lucide-react"
import styles from "../../styles/RecentlyRead.module.css"


function RecentlyRead() {
    // Subscribe to store state
    const recentlyRead = useRecentlyReadStore(state => state.recentlyRead);
    const loading = useRecentlyReadStore(state => state.loading);
    const error = useRecentlyReadStore(state => state.error);
    const user = useAuthStore(state => state.user);
    const authLoading = useAuthStore(state => state.loading);
    const { CompleteChapter, CompleteLoading, CompleteError } = useTrackingBookStore();
    
    useEffect(() => {
        // Only load when auth is done and user exists
        if (!authLoading && user) {
            useRecentlyReadStore.getState().loadRecentlyRead();
        }
    }, [user, authLoading]);

    useEffect(() => {
        if (recentlyRead.length > 0) {
            console.log("libros leidos recientemente", recentlyRead);
        }
    }, [recentlyRead]);

    if (loading) {
        return (
            <div className={styles.ctn_recently_read}>
                <h2 className={styles.title}>Recently Read</h2>
                <p>Loading...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.ctn_recently_read}>
                <h2 className={styles.title}>Recently Read</h2>
                <p>Error: {error}</p>
            </div>
        );
    }

    return (
        <div className={styles.ctn_recently_read}>
            <h2 className={styles.title}>Recently Read</h2>
            
            {recentlyRead.length > 0 ? (
                <ul className={styles.book_list}>
                    {recentlyRead.map((book, index) => (
                        <li className={styles.book_card} key={index}>
                            <header>
                                <div className={styles.ctn_book_txt}>
                                    <h3 className={styles.book_name}>{book.book_data.bookName.toLowerCase()} {book.book_data.chapterNumber}</h3>
                                    <p className={styles.translation}>{book.book_data.translation}</p>
                                </div>
                                <Link to={`/books/${book.book_data.bookId.toLowerCase()}/${book.book_data.chapterNumber}?translation=${book.book_data.translationValue}`}>
                                    Continue
                                </Link>
                            </header>

                            <BookProgress 
                                chapterNumber={book.book_data.numberOfChapters}
                                chapterCompleted={CompleteChapter} 
                                CompleteLoading={CompleteLoading} 
                                CompleteError={CompleteError} 
                                bookId={book.book_data.bookId}
                                translationValue={book.book_data.translationValue}
                            />
                            <p className={styles.last_time}>{formatRelativeTime(book.updated_at)}</p>
                        </li>
                    ))}
                </ul>
            ) : (
                <div className={styles.no_books}>
                    <p>No recently read books</p>
                    <Icon icon={<BookOpen />} size="large" color="grey" />
                    <Link to="/books">Empieza a leer ahora</Link>
                </div>
            )}
        </div>
    );
}

export default RecentlyRead;    