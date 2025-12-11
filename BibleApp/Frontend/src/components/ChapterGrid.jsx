import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useBooksStore } from "../store/BooksStore";
import { useParams } from "react-router-dom";
import FetchError from "./ui/FetchError";
import Loading from "../components/ui/Loading";
import Icon from "../components/ui/Icon";
import BookProgress from "./BookProgress";
import styles from "../styles/ChapterGrid.module.css";
import { CircleCheckBig } from "lucide-react";
import { useTrackingBookStore } from "../store/TrackingBookStore";
import ContinueReadingButton from "./ui/ContinueReadingButton";

function ChapterGrid() {
    let { bookId } = useParams();
    const { books, selectedTranslation, loading, error } = useBooksStore();
    const [chapters, setChapters] = useState([]);
    const [book, setBook] = useState({});
    const { isChapterCompleted, CompleteLoading, CompleteError } = useTrackingBookStore();
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
    
    return (
        <div className={styles.ctn_chapter_grid}>
            <header className={styles.header}>
                <div className={styles.chapter_info}>
                    <h1>{book.commonName ? book.commonName.toLowerCase() : 'Not Found'}</h1>
                    <div className={styles.sub_info}>
                        <p className={styles.translation}>{selectedTranslation.label}</p>
                        <span>|</span>
                        <p>{book.numberOfChapters} chapters</p>
                    </div>
                </div>
                <div>
                     <ContinueReadingButton filterBookId={bookId} />
                </div>
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
