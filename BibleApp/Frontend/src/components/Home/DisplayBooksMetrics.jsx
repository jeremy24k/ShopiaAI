import { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import Select from 'react-select';
import { useTrackingBookStore } from "../../store/TrackingBookStore";
import { useBooksStore } from "../../store/BooksStore";
import { useAuthStore } from "../../store/AuthStore";
import FetchError from "../ui/FetchError";
import NumberLoader from "../ui/NumberLoader";
import Icon from "../../components/ui/Icon";
import { BookOpenCheck, BookOpenText, CircleCheckBig } from "lucide-react";
import styles from "../../styles/DisplayBooksMetrics.module.css";

function DisplayBooksMetrics() {
    const CompleteChapter = useTrackingBookStore(state => state.CompleteChapter);
    const CompleteLoading = useTrackingBookStore(state => state.CompleteLoading);
    const translations = useBooksStore(state => state.translations);
    const books = useBooksStore(state => state.books);
    const selectedTranslation = useBooksStore(state => state.selectedTranslation);
    const setSelectedTranslation = useBooksStore(state => state.setSelectedTranslation);
    const booksLoading = useBooksStore(state => state.loading);
    const user = useAuthStore(state => state.user);
    const authLoading = useAuthStore(state => state.loading);
    const CompleteError = useTrackingBookStore(state => state.CompleteError);

    const filteredCompleteChapter = useMemo(() => 
        CompleteChapter.filter(chapter => 
            chapter.book_data.translationValue === selectedTranslation.value
        ), 
        [CompleteChapter, selectedTranslation.value]
    );

    const booksInProgress = useMemo(() => 
        [...new Set(filteredCompleteChapter.map(chapter => chapter.book_data.bookId))].length,
        [filteredCompleteChapter]
    );

    const booksCompleted = useMemo(() => 
        books.filter(book => {
            const completedChaptersCount = filteredCompleteChapter.filter(
                chapter => chapter.book_data.bookId === book.id
            ).length;
            return completedChaptersCount === book.numberOfChapters && completedChaptersCount > 0;
        }).length,
        [books, filteredCompleteChapter]
    );

    useEffect(() => {
        if (!authLoading && user) {
            useTrackingBookStore.getState().getCompleteChapter();
        }
    }, [authLoading, user]);

    const translationOptions = useMemo(() => 
        translations.map(t => ({ value: t.id, label: t.name })), 
        [translations]
    );

    const isLoading = authLoading || booksLoading || CompleteLoading || books.length === 0;

    if (CompleteError) {
        return <FetchError />;
    }
    
    return (
        <div className={styles.ctn_metrics} aria-label="Display Books Metrics">
            <header className={`${styles.header} ${!user ? styles.header_centered : ''}`}>
                <h3 className={styles.title}>Reading Progress</h3>
                {user && (
                    <Select
                        options={translationOptions}
                        value={selectedTranslation}
                        onChange={(option) => {
                            const full = translations.find(t => t.id === option.value);
                            if (full) {
                                setSelectedTranslation({
                                    value: full.id,
                                    label: full.name,
                                    shortName: full.shortName
                                });
                            }
                        }}
                        placeholder="Select a translation"
                        className="custom-select-translation"
                    />
                )}
            </header>

            {!user ? (
                <div className={styles.no_user_message}>
                    <p>Please log in or register to see your reading progress</p>
                    <Link to="/login">Log in</Link>
                </div>
            ) : (
                <div className={styles.ctn_content}>
                    <div className={styles.metrics}>
                        <div className={styles.metrics_title}>
                            <Icon icon={<BookOpenCheck />} size="small" color="primary" />
                            <p className={styles.metrics_text} aria-label="Chapters Completed">
                                Chapters Completed
                            </p>
                        </div>

                        {isLoading ? (
                            <p className={styles.metrics_count}>
                                <NumberLoader />
                            </p>
                        ) : (
                            <p className={styles.metrics_count} aria-label="Chapters Completed Count">
                                {filteredCompleteChapter.length}
                            </p>
                        )}
                    </div>
                    <div className={styles.metrics}>
                        <div className={styles.metrics_title}>
                            <Icon icon={<BookOpenText />} size="small" color="primary" />
                            <p className={styles.metrics_text} aria-label="Books In Progress">
                                Books In Progress
                            </p>
                        </div>

                        {isLoading ? (
                            <p className={styles.metrics_count}>
                                <NumberLoader />
                            </p>
                        ) : (
                            <p className={styles.metrics_count} aria-label="Books In Progress Count">
                                {booksInProgress}
                            </p>
                        )}
                    </div>
                    <div className={styles.metrics}>
                        <div className={styles.metrics_title}>
                            <Icon icon={<CircleCheckBig />} size="small" color="primary" />
                            <p className={styles.metrics_text} aria-label="Books Completed">
                                Books Completed
                            </p>
                        </div>

                        {isLoading ? (
                            <p className={styles.metrics_count}>
                                <NumberLoader />
                            </p>
                        ) : (
                            <p className={styles.metrics_count} aria-label="Books Completed Count">
                                {booksCompleted}
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default DisplayBooksMetrics;