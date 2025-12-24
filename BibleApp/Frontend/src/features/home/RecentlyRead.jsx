import { Link } from "react-router-dom";
import { useRecentlyReadStore } from "../../store/RecentlyReadStore";
import { useEffect } from "react";
import { useTranslation } from "../../hooks/useTranslation";
import { formatRelativeTime } from "../../utils/FormatTime";
import BookProgress from "../../features/books/BookProgress";
import Icon from "../../components/ui/Icon";
import { BookOpen } from "lucide-react"
import styles from "../../styles/RecentlyRead.module.css"
import SkeletonLoader from "../../components/ui/SkeletonLoader";

function RecentlyRead() {
    const { t } = useTranslation();
    const recentlyRead = useRecentlyReadStore(state => state.recentlyRead);
    const loading = useRecentlyReadStore(state => state.loading);
    const error = useRecentlyReadStore(state => state.error);

    if (error) {
        return (
            <section className={styles.ctn_recently_read} aria-label={t('aria_recently_read_section')}>
                <h2 className={styles.title}>{t('recently_read')}</h2>
                <p role="alert">Error: {error}</p>
            </section>
        );
    }

    return (
        <section className={styles.ctn_recently_read} aria-label={t('aria_recently_read_section')}>
            <h2 className={styles.title}>{t('recently_read')}</h2>
            
            {recentlyRead.length > 0 ? (
                <ul className={styles.book_list} role="list">
                    {recentlyRead.map((book, index) => (
                        <li className={styles.book_card} key={index} role="listitem">
                            {loading ? (
                                <>
                                    <header>
                                        <SkeletonLoader 
                                            variant="text" 
                                            width="100%" 
                                            height="40px"
                                        />
                                    </header>

                                    <SkeletonLoader 
                                        variant="text" 
                                        width="100%" 
                                        height="30px"
                                    />
                                      
                                    <p className={styles.last_time}>
                                        <SkeletonLoader 
                                            variant="text" 
                                            width="100%" 
                                            height="20px"
                                        />
                                    </p>
                                </>
                            ) : ( 
                                <>
                                    <header>
                                        <div className={styles.ctn_book_txt}>
                                            <h3 className={styles.book_name}>{book.book_data.bookName.toLowerCase()} {book.book_data.chapterNumber}</h3>
                                            <p className={styles.translation}>{book.book_data.translation}</p>
                                        </div>
                                        <Link 
                                            to={`/books/${book.book_data.bookId.toLowerCase()}/${book.book_data.chapterNumber}?translation=${book.book_data.translationValue}`}
                                            aria-label={`${t('aria_continue_reading')} ${book.book_data.bookName} ${book.book_data.chapterNumber}`}
                                        >
                                            {t('continue')}
                                        </Link>
                                    </header>

                                    <div aria-label={t('aria_book_progress')}>
                                        <BookProgress 
                                            bookId={book.book_data.bookId}
                                            translationValue={book.book_data.translationValue}
                                        />
                                    </div>
                                    <p className={styles.last_time}>
                                        <time dateTime={book.updated_at}>{formatRelativeTime(book.updated_at, t)}</time>
                                    </p>
                                </>
                            )}
                        </li>
                    ))}
                </ul>
            ) : (
                <div className={styles.no_books}>
                    <p>{t('no_recently_read')}</p>
                    <Icon icon={<BookOpen />} size="large" color="grey" aria-hidden="true" />
                    <Link to="/books" aria-label={t('start_reading_now')}>{t('start_reading_now')}</Link>
                </div>
            )}
        </section>
    );
}

export default RecentlyRead;