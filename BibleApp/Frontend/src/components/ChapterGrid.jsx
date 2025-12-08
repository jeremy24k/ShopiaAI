import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useBooksStore } from "../store/BooksStore";
import { useParams } from "react-router-dom";
import FetchError from "./ui/FetchError";
import Loading from "../components/ui/Loading";
import Icon from "../components/ui/Icon";
import { ArrowRight } from "lucide-react";
import BookProgress from "./BookProgress";
import styles from "../styles/ChapterGrid.module.css";
import { CircleCheckBig } from "lucide-react";
import { useTrackingBookStore } from "../store/TrackingBookStore";
import { useRecentlyReadStore } from "../store/RecentlyReadStore";

function ChapterGrid() {
    let { bookId } = useParams();
    const { books, selectedTranslation, loading, error } = useBooksStore();
    const [chapters, setChapters] = useState([]);
    const [book, setBook] = useState({});
    const [continueReading, setContinueReading] = useState(null);
    const { isChapterCompleted, CompleteLoading, CompleteError } = useTrackingBookStore();
    const recentlyRead = useRecentlyReadStore(state => state.recentlyRead);
    bookId = bookId.toUpperCase();

    const filteredBook = books.find(book => book.id === bookId);

    useEffect(() => {
        if (books.length > 0) {
            if (filteredBook) {
                setBook(filteredBook);
                const limit = filteredBook.numberOfChapters;
                const chaptersArray = Array.from({ length: limit }, (_, i) => ({
                    id: i + 1,
                    order: i + 1,
                    chapterID: `${bookId}-${i + 1}-${selectedTranslation.value}`
                }));
                setChapters(chaptersArray);
            }
        }
    }, [books, bookId]);

    useEffect(() => {
        if (recentlyRead.length > 0) {
            const foundBook = recentlyRead.find(book =>
                book.book_data.bookId === bookId &&
                book.book_data.translationValue === selectedTranslation.value
            );
            if (foundBook) {
                setContinueReading(foundBook.book_data);
            } else {
                setContinueReading(null);
            }
        } else {
            setContinueReading(null);
        }
    }, [recentlyRead, bookId, selectedTranslation.value]);
    
    return (
        <div className={styles.ctn_chapter_grid}>
            <header className={styles.header}>
                <div className={styles.chapter_info}>
                    <h1>{book.commonName}</h1>
                    <div className={styles.sub_info}>
                        <p className={styles.translation}>{selectedTranslation.label}</p>
                        <span>|</span>
                        <p>{book.numberOfChapters} chapters to read</p>
                    </div>
                </div>
                {continueReading && 
                    <Link className={styles.continue_reading} to={`/books/${bookId}/${continueReading.chapterNumber}?translation=${selectedTranslation.value}`}>
                        Continue reading 
                        <Icon icon={<ArrowRight />} size="small" color="white" />
                    </Link>
                }
            </header>

            <BookProgress 
                bookId={bookId}
                translationValue={selectedTranslation.value}
                fontSize="medium"
                iconSize="small"
            />

            <div className={styles.chapter_grid}>
                {loading ? (
                    <Loading />
                ) : error ? (
                    <FetchError />
                ) : chapters.length > 0 ? (
                    chapters.map(chapter => {
                        const isCompleted = isChapterCompleted(chapter.chapterID);
                        return (
                            <Link 
                                className={`${styles.chapter_link} ${isCompleted ? styles.completed : ''}`}
                                key={chapter.id} 
                                to={`/books/${(bookId).toLowerCase()}/${chapter.order}?translation=${selectedTranslation.value}`}
                                style={{
                                    position: 'relative'
                                }}
                            >   
                                {chapter.order}
                                {CompleteLoading ? (
                                    <Loading />
                                ) : (
                                    <div className={styles.completed_container}>
                                        {isCompleted && 
                                            <Icon
                                                icon={<CircleCheckBig />}
                                                size="24"
                                                color="green"
                                            />
                                        }
                                    </div>
                                )}
                            </Link>
                        );
                    })
                ) : (
                    <p>No capítulos encontrados</p>
                )}
            </div>
        </div>
    );
}

export default ChapterGrid;
