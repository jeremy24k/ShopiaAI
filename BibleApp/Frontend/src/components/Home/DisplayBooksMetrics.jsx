import { useEffect, useState, useRef } from "react";
import Select from 'react-select';
import { useTrackingBookStore } from "../../store/TrackingBookStore";
import { useBooksStore } from "../../store/BooksStore";
import { useAuthStore } from "../../store/AuthStore";
import Loading from "../ui/Loading";
import FetchError from "../ui/FetchError";
import Icon from "../../components/ui/Icon";
import { BookOpenCheck, BookOpenText, CircleCheckBig } from "lucide-react";
import styles from "../../styles/DisplayBooksMetrics.module.css";

function DisplayBooksMetrics() {
    const CompleteChapter = useTrackingBookStore(state => state.CompleteChapter);
    const translations = useBooksStore(state => state.translations);
    const books = useBooksStore(state => state.books);
    const user = useAuthStore(state => state.user);
    const authLoading = useAuthStore(state => state.loading);
    const CompleteError = useTrackingBookStore(state => state.CompleteError);

    const [selectedTranslation, setSelectedTranslation] = useState({ 
        value: "spa_r09", 
        label: "R09"
    });

    // Solo una optimización REALMENTE necesaria
    const hasFetchedRef = useRef(false);

    useEffect(() => {
        if (!authLoading && user && !hasFetchedRef.current) {
            hasFetchedRef.current = true;
            useTrackingBookStore.getState().getCompleteChapter();
            console.log("holis");
        }
    }, [user, authLoading]);

    // Filtrado simple - 3 elementos no necesita useMemo
    const filteredCompleteChapter = CompleteChapter.filter(
        chapter => chapter.book_data.translationValue === selectedTranslation.value
    );

    // Cálculos simples - no necesitan useMemo
    const booksInProgress = [...new Set(filteredCompleteChapter.map(chapter => chapter.book_data.bookId))].length;
    
    const booksCompleted = books.filter(book => {
        const completedChaptersCount = filteredCompleteChapter.filter(
            chapter => chapter.book_data.bookId === book.id
        ).length;
        return completedChaptersCount === book.numberOfChapters && completedChaptersCount > 0;
    }).length;
    
    return (
        <div>
            {authLoading ? (
                <Loading />
            ) : CompleteError ? (
                <FetchError />
            ) : (
                <div className={styles.ctn_metrics}>
                    <header className={styles.header}>
                        <h3 className={styles.title}>Reading Progress</h3>
                        <Select
                            options={translations.map(t => ({ value: t.id, label: t.shortName }))}
                            value={selectedTranslation}
                            onChange={setSelectedTranslation}
                            placeholder="Select a translation"
                            className="custom-select-translation"
                        />
                    </header>
                    <div className={styles.ctn_content}>
                        <div className={styles.metrics}>
                            <div className={styles.metrics_title}>
                                <Icon icon={<BookOpenCheck />} size="small" color="primary" />
                                <p className={styles.metrics_text} aria-label="Chapters Completed">
                                    Chapters Completed
                                </p>
                            </div>
                            <p className={styles.metrics_count} aria-label="Chapters Completed Count">
                                {filteredCompleteChapter.length}
                            </p>
                        </div>
                        <div className={styles.metrics}>
                            <div className={styles.metrics_title}>
                                <Icon icon={<BookOpenText />} size="small" color="primary" />
                                <p className={styles.metrics_text} aria-label="Books In Progress">
                                    Books In Progress
                                </p>
                            </div>
                            <p className={styles.metrics_count} aria-label="Books In Progress Count">
                                {booksInProgress}
                            </p>
                        </div>
                        <div className={styles.metrics}>
                            <div className={styles.metrics_title}>
                                <Icon icon={<CircleCheckBig />} size="small" color="primary" />
                                <p className={styles.metrics_text} aria-label="Books Completed">
                                    Books Completed
                                </p>
                            </div>
                            <p className={styles.metrics_count} aria-label="Books Completed Count">
                                {booksCompleted}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default DisplayBooksMetrics;