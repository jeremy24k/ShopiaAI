import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useBooksStore } from "../store/BooksStore";
import { useParams } from "react-router-dom";
import FetchError from "./ui/FetchError";
import Loading from "../components/ui/Loading";
import BookProgress from "./BookProgress";
import { useTrackingBookStore } from "../store/TrackingBookStore";

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

    // ✅ Ya no necesitamos llamar getCompleteChapter aquí, se carga en App.jsx

    return (
        <div>
            <h1>{book.commonName}</h1>
            <h2>{selectedTranslation.label}</h2>
            <BookProgress 
                bookId={bookId}
                translationValue={selectedTranslation.value}
            />
            <div className="chapter-grid">
                {loading ? (
                    <Loading />
                ) : error ? (
                    <FetchError />
                ) : chapters.length > 0 ? (
                    chapters.map(chapter => {
                        const isCompleted = isChapterCompleted(chapter.chapterID);
                        return (
                            <Link 
                                className="chapter-link" 
                                key={chapter.id} 
                                to={`/books/${(bookId).toLowerCase()}/${chapter.order}?translation=${selectedTranslation.value}`}
                                style={{
                                    position: 'relative'
                                }}
                            >   
                                {chapter.order}
                                {CompleteLoading ? (
                                    <Loading />
                                ) : CompleteError ? (
                                    <FetchError />
                                ) : (
                                    isCompleted ? (
                                        <span className="completed">✅</span>
                                    ) : (
                                        <span className="not-completed">❌</span>
                                    )
                                )}
                            </Link>
                        );
                    })
                ) : (
                    <p>No chapters found</p>
                )}
            </div>
        </div>
    );
}

export default ChapterGrid;
