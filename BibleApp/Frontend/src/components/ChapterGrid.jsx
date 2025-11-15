import { Link } from "react-router-dom";
import { BooksContext } from "../context/BooksContext";
import { ReadingContext } from "../context/ReadingContext";
import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import FetchError from "./ui/FetchError";
import Loading from "../components/ui/Loading";
import BookProgress from "./BookProgress";

function ChapterGrid() {
    let { bookId } = useParams();
    const { books, selectedTranslation, loading, error } = useContext(BooksContext);
    const { isChapterCompleted } = useContext(ReadingContext);
    const [chapters, setChapters] = useState([]);
    const [book, setBook] = useState({});

    bookId = bookId.toUpperCase();

    useEffect(() => {
        if (books.length > 0) {
            const filteredBook = books.find(book => book.id === bookId);
            
            if (filteredBook) {
                setBook(filteredBook);
                const limit = filteredBook.numberOfChapters;
                const chaptersArray = Array.from({ length: limit }, (_, i) => ({
                    id: i + 1,
                    order: i + 1
                }));
                setChapters(chaptersArray);
            }
        }
    }, [books, bookId]);
    // ✅ Ya no necesitamos cargar aquí, se carga automáticamente en ReadingContext

    return (
        <div>
            <h1>{book.commonName}</h1>
            <h2>{selectedTranslation.label}</h2>
            
            {/* Componente de progreso del libro */}
            <BookProgress bookId={bookId} totalChapters={book.numberOfChapters} />
            
            <div className="chapter-grid">
                {loading ? (
                    <Loading />
                ) : error ? (
                    <FetchError />
                ) : chapters.length > 0 ? (
                    chapters.map(chapter => {
                        const completed = isChapterCompleted(bookId, chapter.order, selectedTranslation.value);
                        return (
                            <Link 
                                className="chapter-link" 
                                key={chapter.id} 
                                to={`/books/${(bookId).toLowerCase()}/${chapter.order}?translation=${selectedTranslation.value}`}
                                style={{
                                    backgroundColor: completed ? '#4caf50' : '',
                                    color: completed ? 'white' : '',
                                    fontWeight: completed ? 'bold' : 'normal',
                                    position: 'relative'
                                }}
                            >
                                {completed && <span style={{ marginRight: '5px' }}>✓</span>}
                                {chapter.order}
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
